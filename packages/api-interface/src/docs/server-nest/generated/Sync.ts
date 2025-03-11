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
import { ISync } from "@otl/api-interface/src/interfaces/ISync";

export namespace Sync {
    export namespace getDefaultSemester {
        export const method = 'get', apiPath = '/api/sync/defaultSemester', authRequired = true;

        export type RequestParam = never;
        export type RequestBody = never;
        export type RequestQuery = never;
        export type ResponseBody = ISemester.Response;
    }

    export namespace syncScholarDB {
        export const method = 'post', apiPath = '/api/sync/scholarDB', authRequired = true;

        export type RequestParam = never;
        export type RequestBody = { body: ISync.ScholarDBBody };
        export type RequestQuery = never;
        export type ResponseBody = any;
    }

    export namespace syncExamtime {
        export const method = 'post', apiPath = '/api/sync/examtime', authRequired = true;

        export type RequestParam = never;
        export type RequestBody = { body: ISync.ExamtimeBody };
        export type RequestQuery = never;
        export type ResponseBody = any;
    }

    export namespace syncClasstime {
        export const method = 'post', apiPath = '/api/sync/classtime', authRequired = true;

        export type RequestParam = never;
        export type RequestBody = { body: ISync.ClasstimeBody };
        export type RequestQuery = never;
        export type ResponseBody = any;
    }

    export namespace syncTakenLecture {
        export const method = 'post', apiPath = '/api/sync/takenLecture', authRequired = true;

        export type RequestParam = never;
        export type RequestBody = { body: ISync.TakenLectureBody };
        export type RequestQuery = never;
        export type ResponseBody = any;
    }
}
