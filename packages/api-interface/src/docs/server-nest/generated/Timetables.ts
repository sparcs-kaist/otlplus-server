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
import { ITimetable } from "@otl/api-interface/src/interfaces";
import { IPlanner } from "@otl/api-interface/src/interfaces/IPlanner";
import { IRate } from "@otl/api-interface/src/interfaces/IRate";
import { ISemester } from "@otl/api-interface/src/interfaces/ISemester";
import { ISync } from "@otl/api-interface/src/interfaces/ISync";

export namespace Timetables {
    export namespace getTimetables {
        export const method = 'get', apiPath = '//api/users/:userId/timetables/', authRequired = true;

        export type RequestParam = { userId: number };
        export type RequestBody = never;
        export type RequestQuery = { query: ITimetable.QueryDto };
        export type ResponseBody = ITimetable.Response[];
    }

    export namespace getTimeTable {
        export const method = 'get', apiPath = '//api/users/:userId/timetables//:timetableId', authRequired = true;

        export type RequestParam = { userId: number; timetableId: number };
        export type RequestBody = never;
        export type RequestQuery = never;
        export type ResponseBody = ITimetable.Response;
    }

    export namespace deleteTimetable {
        export const method = 'delete', apiPath = '//api/users/:userId/timetables//:timetableId', authRequired = true;

        export type RequestParam = { userId: number; timetableId: number };
        export type RequestBody = never;
        export type RequestQuery = never;
        export type ResponseBody = ITimetable.Response[];
    }

    export namespace createTimetable {
        export const method = 'post', apiPath = '//api/users/:userId/timetables/', authRequired = true;

        export type RequestParam = never;
        export type RequestBody = { timeTableBody: ITimetable.CreateDto };
        export type RequestQuery = never;
        export type ResponseBody = ITimetable.Response;
    }

    export namespace addLectureToTimetable {
        export const method = 'post', apiPath = '//api/users/:userId/timetables//:timetableId/add-lecture', authRequired = true;

        export type RequestParam = { timetableId: number };
        export type RequestBody = { body: ITimetable.AddLectureDto };
        export type RequestQuery = never;
        export type ResponseBody = ITimetable.Response;
    }

    export namespace removeLectureFromTimetable {
        export const method = 'post', apiPath = '//api/users/:userId/timetables//:timetableId/remove-lecture', authRequired = true;

        export type RequestParam = { timetableId: number };
        export type RequestBody = { body: ITimetable.AddLectureDto };
        export type RequestQuery = never;
        export type ResponseBody = ITimetable.Response;
    }

    export namespace reorderTimetable {
        export const method = 'post', apiPath = '//api/users/:userId/timetables//:timetableId/reorder', authRequired = true;

        export type RequestParam = { userId: number; timetableId: number };
        export type RequestBody = { body: ITimetable.ReorderTimetableDto };
        export type RequestQuery = never;
        export type ResponseBody = ITimetable.Response;
    }
}
