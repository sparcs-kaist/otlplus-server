import { IAuth } from "@otl/api-interface/src/interfaces";
import { IUser } from "@otl/api-interface/src/interfaces";
import { ICourse } from "@otl/api-interface/src/interfaces";
import { ILecture } from "@otl/api-interface/src/interfaces";
import { IReview } from "@otl/api-interface/src/interfaces";

export namespace Course {
    export namespace getCourses {
        export const method = 'get', apiPath = '/api/courses/', authRequired = false;

        export type RequestParam = never;
        export type RequestBody = never;
        export type RequestQuery = { query: ICourse.Query };
        export type ResponseBody = ICourse.DetailWithIsRead[];
    }

    export namespace getCourseAutocomplete {
        export const method = 'get', apiPath = '/api/courses/autocomplete', authRequired = false;

        export type RequestParam = never;
        export type RequestBody = never;
        export type RequestQuery = { query: ICourse.AutocompleteQueryDto };
        export type ResponseBody = string;
    }

    export namespace getCourseById {
        export const method = 'get', apiPath = '/api/courses/:id', authRequired = false;

        export type RequestParam = { id: number };
        export type RequestBody = never;
        export type RequestQuery = never;
        export type ResponseBody = ICourse.DetailWithIsRead;
    }

    export namespace getLecturesByCourseId {
        export const method = 'get', apiPath = '/api/courses/:id/lectures', authRequired = false;

        export type RequestParam = { id: number };
        export type RequestBody = never;
        export type RequestQuery = { query: ICourse.LectureQueryDto };
        export type ResponseBody = ILecture.Detail[];
    }

    export namespace getReviewByCourseId {
        export const method = 'get', apiPath = '/api/courses/:id/reviews', authRequired = false;

        export type RequestParam = { id: number };
        export type RequestBody = never;
        export type RequestQuery = { query: ICourse.ReviewQueryDto };
        export type ResponseBody = IReview.Basic[];
    }

    export namespace readCourse {
        export const method = 'post', apiPath = '/api/courses/:id/read', authRequired = true;

        export type RequestParam = { id: number };
        export type RequestBody = never;
        export type RequestQuery = never;
        export type ResponseBody = ICourseUser.Basic;
    }
}
