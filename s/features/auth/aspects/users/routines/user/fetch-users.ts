
import {ApiError} from "renraku/x/api/api-error.js"

import {UserStats} from "../../types/user-stats.js"
import {AuthTables} from "../../../../types/auth-tables.js"
import {profileFromRow} from "../profile/profile-from-row.js"
import {or} from "../../../../../../toolbox/dbby/dbby-helpers.js"
import {DamnId} from "../../../../../../toolbox/damnedb/damn-id.js"
import {PermissionsEngine} from "../../../../../../assembly/backend/permissions/types/permissions-engine.js"

export async function fetchUsers({userIds, authTables, permissionsEngine}: {
		userIds: DamnId[]
		authTables: AuthTables
		permissionsEngine: PermissionsEngine
	}) {

	if (!userIds.length)
		throw new Error("invalid: userIds cannot be empty")

	const conditions = or(...userIds.map(userId => ({equal: {userId}})))
	const accounts = await authTables.users.accounts.read({conditions})
	const profiles = await authTables.users.profiles.read({conditions})

	const publicRolesForUsers =
		await permissionsEngine
			.getPublicRolesForUsers(userIds.map(id => id.toString()))

	function assembleDetailsForEachUser(userId: DamnId) {
		const account = accounts.find(a => a.userId.toString() === userId.toString())
		const profile = profiles.find(p => p.userId.toString() === userId.toString())

		if (!account)
			throw new ApiError(404, `account not found for user id ${userId}`)

		if (!profile)
			throw new ApiError(404, `profile not found for user id ${userId}`)

		const roles = publicRolesForUsers
			.find(r => r.userId.toString() === userId.toString())
			.publicUserRoles

		const stats: UserStats = {
			joined: account.created,
		}

		return {
			userId: userId.toString(),
			profile: profileFromRow(profile),
			roles,
			stats,
		}
	}

	return userIds.map(assembleDetailsForEachUser)
}
