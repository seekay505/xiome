
import {UserAuth} from "../../../../../auth/auth-types.js"
import {PayTables} from "../../../tables/types/pay-tables.js"
import {StripeLiaison} from "../../../../stripe/types/stripe-liaison.js"
import {AuthTables} from "../../../../../auth/tables/types/auth-tables.js"

export interface PayUserAuth extends UserAuth {
	tables: AuthTables & PayTables
	stripeLiaison: StripeLiaison
}