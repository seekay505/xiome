
import {VideoTables} from "../../../types/video-tables.js"
import {find} from "../../../../../toolbox/dbby/dbby-helpers.js"
import {DamnId} from "../../../../../toolbox/damnedb/damn-id.js"
import {PermissionsEngine} from "../../../../../assembly/backend/permissions/types/permissions-engine.js"

export async function setViewPermissions({
		label,
		engine,
		videoTables,
		privileges: privilegesInput,
	}: {
		label: string
		privileges: string[]
		videoTables: VideoTables
		engine: PermissionsEngine
	}) {

	// delete all privileges associated with this view
	await videoTables.viewPrivileges.delete(find({label}))

	// select only privileges that actually exist
	const privileges = await engine.getPrivileges(privilegesInput)
		.then(displays => displays
			.filter(d => !!d)
			.map(d => d.privilegeId.toString())
		)

	// add new privileges for this view
	await videoTables.viewPrivileges.create(
		...privileges.map(privilege => ({
			label,
			privilegeId: DamnId.fromString(privilege),
		}))
	)
}
