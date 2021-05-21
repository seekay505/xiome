
import {find, or} from "../../../toolbox/dbby/dbby-helpers.js"
import {RoleRow} from "../../../features/auth/tables/types/rows/role-row.js"
import {PublicUserRole} from "../../../features/auth/types/public-user-role.js"
import {permissionsMergingFacility} from "./merging/permissions-merging-facility.js"
import {PermissionsTables} from "../../../features/auth/tables/types/table-groups/permissions-tables.js"
import {isCurrentlyWithinTimeframe} from "../../../features/auth/topics/login/user/utils/is-currently-within-timeframe.js"
import {merge} from "../../../toolbox/merge.js"
import {PrivilegeRow} from "../../../features/auth/tables/types/rows/privilege-row.js"
import {concurrent} from "../../../toolbox/concurrent.js"

export function makePermissionsEngine({isPlatform, permissionsTables}: {
		isPlatform: boolean
		permissionsTables: PermissionsTables
	}) {

	const {
		hardPermissions,
		mergeRoleHasPrivileges,
		getActivePrivilegeIds,
		getHardPrivilegeDetails,
	} = permissionsMergingFacility({isPlatform})

	async function getAnonymousPrivileges() {
		const roleId = hardPermissions.roles.anonymous.roleId
		const hard = getHardPrivilegeDetails(roleId)
		const soft = await permissionsTables.roleHasPrivilege
			.read(find({roleId}))
		return getActivePrivilegeIds(mergeRoleHasPrivileges({hard, soft}))
	}

	async function getUsersHaveRoles({userIds, onlyGetPublicRoles}: {
			userIds: string[]
			onlyGetPublicRoles: boolean
		}) {
		
		const isPublic = (row: {public: boolean}) => row.public
		const all = <X>(x: X) => x
		
		const usersHaveRoles = await permissionsTables.userHasRole.read({
			conditions: or(...userIds.map(userId => ({equal: {userId}})))
		})

		return userIds.map(userId => {
			const raw = usersHaveRoles.filter(r => r.userId === userId)
			const userHasRoles = raw
				.filter(isCurrentlyWithinTimeframe)
				.filter(onlyGetPublicRoles ? isPublic : all)
			return {userId, userHasRoles}
		})
	}

	async function getPrivilegesForUsers(userIds: string[]) {
		const rolesForUsers = await getUsersHaveRoles({
			userIds,
			onlyGetPublicRoles: false,
		})

		const allRoleIds = rolesForUsers
			.flatMap(r => r.userHasRoles.map(r2 => r2.roleId))

		const allRolesHavePrivileges = await permissionsTables.roleHasPrivilege.read({
			conditions: or(...allRoleIds.map(roleId => ({equal: ({roleId})})))
		})

		function resolvePrivilegesForEachUser(userId: string) {
			const roleIds = rolesForUsers
				.find(r => r.userId === userId)
				.userHasRoles
				.map(r => r.roleId)
			const hard = getHardPrivilegeDetails(...roleIds)
			const soft = roleIds
				.flatMap(roleId => allRolesHavePrivileges.filter(p => p.roleId === roleId))
			const privileges = getActivePrivilegeIds(mergeRoleHasPrivileges({hard, soft}))
			return {userId, privileges}
		}

		return userIds.map(resolvePrivilegesForEachUser)
	}

	async function getPublicRolesForUsers(userIds: string[]) {
		const rolesForUsers = await getUsersHaveRoles({
			userIds,
			onlyGetPublicRoles: true,
		})

		const allRoleIds = rolesForUsers
			.flatMap(r => r.userHasRoles.map(r2 => r2.roleId))

		const allHardRoles: RoleRow[] = allRoleIds.map(roleId => {
			const [label, role] = Object.entries(hardPermissions.roles)
				.find(([,role]) => role.roleId === roleId)
			return {roleId, label, public: role.public, hard: true}
		})

		const allSoftRoles = await permissionsTables.role.read({
			conditions: or(...allRoleIds.map(roleId => ({equal: {roleId}})))
		})

		const mergedRoles = [...allHardRoles]
		for (const role of allSoftRoles) {
			const found = mergedRoles.find(r => r.roleId === role.roleId)
			if (!found)
				mergedRoles.push(role)
		}

		function assemblePublicRolesForEachUser(userId: string) {
			const userHasRoles = rolesForUsers
				.find(r => r.userId === userId)
				.userHasRoles
			const publicUserRoles = userHasRoles
				.map(userHasRole => {
					const roleRow = mergedRoles.find(row => row.roleId === userHasRole.roleId)
					return {...userHasRole, ...roleRow}
				})
				.filter(isCurrentlyWithinTimeframe)
				.map(r => (<PublicUserRole>{
					label: r.label,
					roleId: r.roleId,
					timeframeEnd: r.timeframeEnd,
					timeframeStart: r.timeframeStart,
				}))
			return {userId, publicUserRoles}
		}

		return userIds.map(assemblePublicRolesForEachUser)
	}

	async function getPermissionsDisplay() {
		const all = {conditions: false} as const
		return concurrent({
			roles: (async() => {
				const soft = await permissionsTables.role.read(all)
				const hard: RoleRow[] = Object.entries(hardPermissions.roles)
					.map(([label, r]) => ({
						label,
						hard: true,
						roleId: r.roleId,
						public: r.public,
					}))
				return merge(soft, hard, (a, b) => a.roleId === b.roleId)
			})(),
			privileges: (async() => {
				const soft = await permissionsTables.privilege.read(all)
				const hard: PrivilegeRow[] = Object.entries(hardPermissions.privileges)
					.map(([label, privilegeId]) => ({privilegeId, label, hard: true}))
				return merge(soft, hard, (a, b) => a.privilegeId === b.privilegeId)
			})(),
			rolesHavePrivileges: (async() => {
				const roleIds = Object.values(hardPermissions.roles)
					.map(role => role.roleId)
				const hard = getHardPrivilegeDetails(...roleIds)
				const soft = await permissionsTables.roleHasPrivilege.read(all)
				return mergeRoleHasPrivileges({hard, soft})
			})(),
		})
	}

	return {
		getAnonymousPrivileges,
		getPrivilegesForUsers,
		getPublicRoleDataForUsers: getPublicRolesForUsers,
		getPermissionsDisplay,
	}
}