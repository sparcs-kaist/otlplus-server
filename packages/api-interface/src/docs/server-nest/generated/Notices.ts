import { IAuth } from "@otl/api-interface/src/interfaces";
import { IUser } from "@otl/api-interface/src/interfaces";
import { ICourse } from "@otl/api-interface/src/interfaces";
import { ILecture } from "@otl/api-interface/src/interfaces";
import { IReview } from "@otl/api-interface/src/interfaces";
import { IFeed } from "@otl/api-interface/src/interfaces";
import { INotice } from "@otl/api-interface/src/interfaces";

export namespace Notices {
    export namespace getNotices {
        export const method = 'get', apiPath = '/api/notices/', authRequired = false;

        export type RequestParam = never;
        export type RequestBody = never;
        export type RequestQuery = never;
        export type ResponseBody = INotice.Basic[];
    }
}
