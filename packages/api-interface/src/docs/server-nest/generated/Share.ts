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

export namespace Share {
    export namespace getTimetableImage {
        export const method = 'get', apiPath = '//api/share/timetable/image', authRequired = true;

        export type RequestParam = never;
        export type RequestBody = never;
        export type RequestQuery = { query: IShare.TimetableImageQueryDto };
        export type ResponseBody = void;
    }

    export namespace getTimetableIcal {
        export const method = 'get', apiPath = '//api/share/timetable/ical', authRequired = true;

        export type RequestParam = never;
        export type RequestBody = never;
        export type RequestQuery = { query: IShare.TimetableIcalQueryDto };
        export type ResponseBody = void;
    }
}
