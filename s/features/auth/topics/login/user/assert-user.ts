
import {CoreTables, User} from "../../../auth-types.js"
import {concurrent} from "../../../../../toolbox/concurrent.js"
import {and} from "../../../../../toolbox/dbby/dbby-helpers.js"

import {fetchTags} from "./fetch-tags.js"
import {profileFromRow} from "./profile-from-row.js"
import {generateProfileRow} from "./generate-profile-row.js"

export async function assertUser({userId, tables, generateNickname}: {
			userId: string
			tables: CoreTables
			generateNickname: () => string
		}): Promise<User> {

	const {tags, profile} = await concurrent({
		tags: await fetchTags(userId),
		profile: profileFromRow(
			await tables.profile.assert({
				conditions: and({equal: {userId}}),
				make: async() => generateProfileRow({userId, generateNickname}),
			})
		),
	})

	return {userId, tags, profile}
}