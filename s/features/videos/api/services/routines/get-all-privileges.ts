
import {AuthTables} from "../../../../auth/types/auth-tables.js"
import {PrivilegeDisplay} from "../../../../auth/aspects/users/routines/permissions/types/privilege-display.js"
import {viewPrivilege} from "../../../testing/video-setup.js"
import {makePermissionsEngine} from "../../../../../assembly/backend/permissions/permissions-engine.js"
import {AccessPayload} from "../../../../auth/types/auth-tokens.js"
import {PermissionsTables} from "../../../../auth/aspects/permissions/types/permissions-tables.js"

export async function getAllPrivileges({
	access,
	platformAppId,
	permissionsTables,
	}: {
		access: AccessPayload
		platformAppId: string
		permissionsTables: PermissionsTables
	}): Promise<PrivilegeDisplay[]> {
	
	const permissionsEngine = makePermissionsEngine({
		permissionsTables,
		isPlatform: access.appId === platformAppId
	})

	const permissionsDisplay = await permissionsEngine
		.getPermissionsDisplay()

	return permissionsDisplay.privileges
}
