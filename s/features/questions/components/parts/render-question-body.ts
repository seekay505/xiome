
import {html} from "../../../../framework/component/component.js"
import {formatDate} from "../../../../toolbox/goodtimes/format-date.js"
import {ValueChangeEvent} from "../../../xio-components/inputs/events/value-change-event.js"
import {validateQuestionDraftContent} from "../../api/services/validation/validate-question-draft.js"

export function renderQuestionBody({
		content,
		editable,
		timePosted,
		handleValueChange = () => {},
	}: {
		editable: boolean
		timePosted: number
		content?: string
		handleValueChange?: (event: ValueChangeEvent<string>) => void
	}) {

	const {date, time} = formatDate(timePosted)
	
	return html`
		<div class=question-body ?data-editable=${editable}>
			<div class=textbox>
				${editable
					? html`
						<xio-text-input
							textarea
							.validator=${validateQuestionDraftContent}
							@valuechange=${handleValueChange}
						></xio-text-input>
					`
					: html`
						<p>${content}</p>
					`}
			</div>
			<div class=metabar>
				<p>${`${date} ${time}`}</p>
			</div>
		</div>
	`
}
