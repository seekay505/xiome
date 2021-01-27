
import styles from "./zap-loading.css.js"
import {loading, LoadingView} from "../../../toolbox/loading2.js"
import {Component, html, mixinStyles, property} from "../../../framework/component.js"

import errorSvg from "../../../framework/icons/error.svg.js"
import spinnerSvg from "../../../framework/icons/spinner.svg.js"

@mixinStyles(styles)
export class ZapLoading<xPayload = any> extends Component {

	@property({type: Object})
	loadingView: LoadingView<xPayload> = loading<xPayload>().view

	@property({type: Object})
	errorIcon = errorSvg

	@property({type: Object})
	loadingIcon = spinnerSvg

	@property({type: String})
	["loading-message"] = "loading..."

	@property({type: String})
	["error-message"] = "error"

	render() {
		return this.loadingView.select({
			none: () => html`
				<slot name=none></slot>
			`,
			loading: () => html`
				<slot name=loading>
					${this.loadingIcon}
					<span>${this["loading-message"]}</span>
				</slot>
			`,
			error: reason => html`
				<slot name=error>
					${this.errorIcon}
					<span>${reason ?? this["fallbackErrorMessage"]}</span>
				</slot>
			`,
			ready: () => html`
				<slot></slot>
			`,
		})
	}
}