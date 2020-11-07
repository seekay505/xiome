
import {Suite} from "cynic"
import pay from "./features/pay/pay-stories.test.js"
import dbby from "./toolbox/dbby/dbby.test.js"
import core from "./features/core/core-stories.test.js"

export default <Suite>{
	"toolbox": {dbby},
	"stories": {core, pay},
}