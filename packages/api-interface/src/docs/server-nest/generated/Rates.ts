import { IAuth } from "@otl/api-interface/src/interfaces";
import { IUser } from "@otl/api-interface/src/interfaces";
import { ICourse } from "@otl/api-interface/src/interfaces";
import { ILecture } from "@otl/api-interface/src/interfaces";
import { IReview } from "@otl/api-interface/src/interfaces";
import { IFeed } from "@otl/api-interface/src/interfaces";
import { INotice } from "@otl/api-interface/src/interfaces";
import { IPlanner } from "@otl/api-interface/src/interfaces/IPlanner";
import { IRate } from "@otl/api-interface/src/interfaces/IRate";

export namespace Rates {
    export namespace createRates {
        export const method = 'post', apiPath = '/api/rates/', authRequired = true;

        export type RequestParam = never;
        export type RequestBody = { body: IRate.CreateDto };
        export type RequestQuery = never;
        export type ResponseBody = IRate.Basic;
    }
}
