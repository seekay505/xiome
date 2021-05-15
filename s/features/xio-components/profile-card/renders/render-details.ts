
import {User} from "../../../auth/types/user.js"
import {html} from "../../../../framework/component2/component2.js"
import {formatDate} from "../../../../toolbox/goodtimes/format-date.js"

export function renderDetails(user: User) {
	return html`
		<ul class=detail>
			<li>
				<span>joined:</span>
				<span>${formatDate(user.stats.joined).date}</span>
			</li>
			<li>
				<xio-id
					label="user id"
					id="${user.userId}"
				></xio-id>
			</li>
		</ul>
	`
}
