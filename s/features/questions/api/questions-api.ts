
import {asApi} from "renraku/x/identities/as-api.js"
import {QuestionsApiOptions} from "./types/questions-api-options.js"
import {makeQuestionsReadingService} from "./services/questions-reading-service.js"
import {makeQuestionsPostingService} from "./services/questions-posting-service.js"
import {makeQuestionsAnsweringService} from "./services/questions-answering-service.js"
import {makeQuestionsModerationService} from "./services/questions-moderation-service.js"

export function questionsApi(options: QuestionsApiOptions) {
	return asApi({
		questionsReadingService: makeQuestionsReadingService(options),
		questionsPostingService: makeQuestionsPostingService(options),
		questionsAnsweringService: makeQuestionsAnsweringService(options),
		questionsModerationService: makeQuestionsModerationService(options),
	})
}
