
import {applyMockHacks} from "./frontend/mocks/apply-mock-hacks.js"
import {mockConnectApp} from "./frontend/connect/mock/mock-connect-app.js"
import {memoryFlexStorage} from "../toolbox/flex-storage/memory-flex-storage.js"
import {registerComponents} from "../framework/component2/register-components.js"
import {assembleAndInitializeFrontend} from "./frontend/assemble-and-initialize-frontend.js"

export async function demos() {
	const connection = await mockConnectApp({
		appWindowLink: window.location.href,
		origins: [window.location.origin],
		storage: memoryFlexStorage(),
		latency: false,
	})
	const frontend = await assembleAndInitializeFrontend(connection)
	applyMockHacks({connection, frontend})
	const xiome = {...connection, ...frontend}
	document.body.prepend(xiome.modalsElement)

	await xiome.models.accessModel.sendLoginLink("creative@xiome.io")

	// TODO fix localstorage creep
	console.log("demo tables increase every refresh??", await connection.backend.database.authTables.unconstrained.permissions.userHasRole.read({conditions: false}))

	const demoComponents = {}
	for (const [key, value] of Object.entries(xiome.components))
		demoComponents[`Demo${key}`] = value

	registerComponents(demoComponents)
}
