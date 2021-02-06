

import {getRando} from "../../../toolbox/get-rando.js"
import {mockBackend} from "../../backend/mock-backend.js"
import {platformLabel, technicianEmail} from "../../constants.js"
import {prepareSendLoginEmail} from "../../../features/auth/tools/emails/send-login-email.js"
import {standardNicknameGenerator} from "../../../features/auth/tools/nicknames/standard-nickname-generator.js"

import {SendEmail} from "../../../features/auth/auth-types.js"
import {SimpleStorage} from "../../../toolbox/json-storage.js"

export async function mockStandardBackend({
		platformHome, tableStorage, sendEmail
	}: {
		platformHome: string
		tableStorage: SimpleStorage
		sendEmail: SendEmail
	}) {

	const rando = await getRando()
	const backend = await mockBackend({
		rando,
		tableStorage,
		platformHome,
		platformLabel,
		technicianEmail,
		sendLoginEmail: prepareSendLoginEmail({sendEmail}),
		generateNickname: standardNicknameGenerator({rando}),
	})

	return {rando, backend}
}