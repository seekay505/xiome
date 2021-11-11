
import {nap} from "../../../toolbox/nap.js"
import {ops} from "../../../framework/ops.js"
import {makeChatModel} from "../models/chat-model.js"
import {getRando} from "../../../toolbox/get-rando.js"
import {ChatStatus} from "../common/types/chat-concepts.js"
import {chatPrivileges} from "../common/chat-privileges.js"
import {makeChatServerCore} from "../api/cores/chat-server-core.js"
import {prepareChatClientCore} from "../api/cores/chat-client-core.js"
import {mockChatMeta, mockChatPolicy} from "./mocks/mock-chat-policy.js"
import {mockChatPersistence} from "../api/cores/persistence/mock-chat-persistence.js"
import {memoryFlexStorage} from "../../../toolbox/flex-storage/memory-flex-storage.js"
import {appPermissions} from "../../../assembly/backend/permissions/standard-permissions.js"

export async function testChatSetup() {
	const rando = await getRando()
	const storage = memoryFlexStorage()
	const persistence = await mockChatPersistence(storage)

	async function makeServer() {
		const servelet = makeChatServerCore({
			rando,
			persistence,
			policy: mockChatPolicy,
		})

		async function makeClient(privileges: string[]) {
			const {chatConnect} = prepareChatClientCore({
				connectToServer: async({handleDataFromServer}) => {
					const serverConnection = await servelet.acceptConnection({
						disconnect: () => {},
						sendDataToClient: handleDataFromServer,
					})
					return {
						sendDataToServer: serverConnection.handleDataFromClient,
						disconnect: async() => serverConnection.handleDisconnect(),
					}
				},
			})
			const userId = rando.randomId().toString()
			const access = {
				appId: undefined,
				origins: [],
				permit: {privileges},
				scope: {core: false},
				user: {
					userId,
					profile: {
						avatar: undefined,
						nickname: `nickname-${userId.slice(0, 7)}`,
						tagline: "",
					},
					roles: [],
					stats: undefined,
				},
			}
			const chatModel = makeChatModel({
				chatConnect,
				getChatMeta: async() => mockChatMeta({access}),
			})
			await chatModel.updateAccessOp(ops.ready(access))
			return {chatModel}
		}

		return {
			makeClientFor: {
				forbidden: () => makeClient([]),
				viewer: () => makeClient([chatPrivileges["view all chats"]]),
				participant: () => makeClient([chatPrivileges["participate in all chats"]]),
				moderator: () => makeClient([chatPrivileges["moderate all chats"]]),
				bannedParticipant: () => makeClient([
					chatPrivileges["participate in all chats"],
					appPermissions.privileges["banned"],
				]),
			},
		}
	}

	return {
		makeServer,
		async startOnline() {
			const server = await makeServer()
			const moderator = await server.makeClientFor.moderator()
			const roomLabel = "default"
			const room = await moderator.chatModel.room(roomLabel)
			room.setRoomStatus(ChatStatus.Online)
			await nap()
			return {server, moderator, roomLabel}
		},
	}
}
