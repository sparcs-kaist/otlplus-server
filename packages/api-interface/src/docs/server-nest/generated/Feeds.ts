import { IAuth } from "@otl/api-interface/src/interfaces";
import { IUser } from "@otl/api-interface/src/interfaces";
import { ICourse } from "@otl/api-interface/src/interfaces";
import { ILecture } from "@otl/api-interface/src/interfaces";
import { IReview } from "@otl/api-interface/src/interfaces";
import { IFeed } from "@otl/api-interface/src/interfaces";

export namespace Feeds {
    export namespace getUserFeeds {
        export const method = 'get', apiPath = '/api/users/:userId/feeds/', authRequired = true;

        export type RequestParam = never;
        export type RequestBody = never;
        export type RequestQuery = { query: IFeed.QueryDto };
        export type ResponseBody = IFeed.Details[];
    }
}
