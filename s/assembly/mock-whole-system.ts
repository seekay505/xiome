
import {mockSignToken} from "redcrypto/dist/curries/mock-sign-token.js"
import {mockVerifyToken} from "redcrypto/dist/curries/mock-verify-token.js"

import {mockPlatformConfig} from "../features/auth/mocks/mock-platform-config.js"
import {AppPayload, AuthTokens, SendEmail, TriggerAccountPopup} from "../features/auth/auth-types.js"

import {getRando} from "../toolbox/get-rando.js"
import {SimpleStorage} from "../toolbox/json-storage.js"
import {dbbyMemory} from "../toolbox/dbby/dbby-memory.js"

import {SystemTables} from "./assembly-types.js"
import {expiryGraceTime} from "./constants.js"
import {assembleBackend} from "./assemble-backend.js"
import {assembleFrontend} from "./assemble-frontend.js"

export async function mockWholeSystem({storage, sendEmail, generateNickname}: {
			storage: SimpleStorage
			sendEmail: SendEmail
			generateNickname: () => string
		}) {

	// prerequisites and configurations

	const rando = await getRando()

	// TODO figure this out
	const {technicianPasskey, technician} = <any>{}

	const config = mockPlatformConfig({rando, technician})
	const signToken = mockSignToken()
	const verifyToken = mockVerifyToken()
	const tables: SystemTables = {
		core: {
			account: dbbyMemory(),
			profile: dbbyMemory(),
			userRole: dbbyMemory(),
			rolePrivilege: dbbyMemory(),
			accountViaEmail: dbbyMemory(),
			accountViaGoogle: dbbyMemory(),
		},
	}

	// backend assembly

	const backend = await assembleBackend({
		rando,
		config,
		tables,
		storage,
		sendEmail,
		signToken,
		verifyToken,
		generateNickname,
	})

	// mock bridge connecting backend and frontend

	let triggerAccountPopupAction: TriggerAccountPopup = async() => {
		throw new Error("no mock login set")
	}

	function mockNextLogin(auth: () => Promise<AuthTokens>) {
		triggerAccountPopupAction = async() => auth()
	}

	// frontend assembly

	const frontend = await assembleFrontend({
		backend,
		expiryGraceTime,
		triggerAccountPopup: async() => triggerAccountPopupAction(),
	})

	// return everything including internals for testing and debugging

	async function signAppToken(payload: AppPayload) {
		return signToken({payload, lifespan: config.tokens.lifespans.app})
	}

	return {
		config,
		tables,
		backend,
		frontend,
		technicianPasskey,
		signAppToken,
		mockNextLogin,
	}
}
