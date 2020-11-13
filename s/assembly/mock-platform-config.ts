
import {Rando} from "../toolbox/get-rando.js"

import {PlatformConfig} from "../features/core/core-types.js"
import {writePasskey} from "../features/core/authtools/write-passkey.js"
import {generatePasskey} from "../features/core/authtools/passkeytools/generate-passkey.js"

export function mockPlatformConfig({rando}: {rando: Rando}): PlatformConfig {
	const minute = 1000 * 60
	const day = minute * 60 * 24
	return {
		mongo: {
			link: "mock-mongo-link",
			database: "platform",
		},
		google: {
			clientId: "mock-google-token",
		},
		platform: {
			app: {
				appId: rando.randomId(),
				origins: [
					"localhost:8080",
				],
			},
			technician: {
				passkey: writePasskey(generatePasskey(rando)),
			},
		},
		stripe: {
			apiKey: "mock-stripe-api-key",
			secret: "mock-stripe-secret",
			webhookSecret: "mock-stripe-webhook-secret",
		},
		tokens: {
			lifespans: {
				app: 30 * day,
				refresh: 30 * day,
				access: 20 * minute,
				external: 10 * minute,
			}
		},
	}
}
