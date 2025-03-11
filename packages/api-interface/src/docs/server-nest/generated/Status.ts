import { IAuth } from "@otl/api-interface/src/interfaces";
import { IUser } from "@otl/api-interface/src/interfaces";
import { ICourse } from "@otl/api-interface/src/interfaces";
import { ILecture } from "@otl/api-interface/src/interfaces";
import { IReview } from "@otl/api-interface/src/interfaces";
import { IFeed } from "@otl/api-interface/src/interfaces";
import { INotice } from "@otl/api-interface/src/interfaces";
import { IDepartment } from "@otl/api-interface/src/interfaces";
import { ISession } from "@otl/api-interface/src/interfaces";
import { IShare } from "@otl/api-interface/src/interfaces";
import { IPlanner } from "@otl/api-interface/src/interfaces/IPlanner";
import { IRate } from "@otl/api-interface/src/interfaces/IRate";
import { ISemester } from "@otl/api-interface/src/interfaces/ISemester";

export namespace Status {
    export namespace getStatus {
        export const method = 'get', apiPath = '/api/status/', authRequired = false;

        export type RequestParam = never;
        export type RequestBody = never;
        export type RequestQuery = never;
        export type ResponseBody = never;
    }
}
