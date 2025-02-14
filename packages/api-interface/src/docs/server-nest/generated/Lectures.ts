import { IAuth } from "@otl/api-interface/src/interfaces";
import { IUser } from "@otl/api-interface/src/interfaces";
import { ICourse } from "@otl/api-interface/src/interfaces";
import { ILecture } from "@otl/api-interface/src/interfaces";
import { IReview } from "@otl/api-interface/src/interfaces";
import { IFeed } from "@otl/api-interface/src/interfaces";

export namespace Lectures {
    export namespace getLectures {
        export const method = 'get', apiPath = '/api/lectures/', authRequired = false;

        export type RequestParam = never;
        export type RequestBody = never;
        export type RequestQuery = { query: ILecture.QueryDto };
        export type ResponseBody = ILecture.Detail[];
    }

    export namespace getLectureAutocomplete {
        export const method = 'get', apiPath = '/api/lectures/autocomplete', authRequired = false;

        export type RequestParam = never;
        export type RequestBody = never;
        export type RequestQuery = { query: ILecture.AutocompleteQueryDto };
        export type ResponseBody = string;
    }

    export namespace getLectureById {
        export const method = 'get', apiPath = '/api/lectures/:id', authRequired = false;

        export type RequestParam = { id: number };
        export type RequestBody = never;
        export type RequestQuery = never;
        export type ResponseBody = ILecture.Detail;
    }

    export namespace getLectureReviews {
        export const method = 'get', apiPath = '/api/lectures/:lectureId/reviews', authRequired = false;

        export type RequestParam = { lectureId: number };
        export type RequestBody = never;
        export type RequestQuery = { query: IReview.LectureReviewsQueryDto };
        export type ResponseBody = (IReview.Basic & { userspecific_is_liked: boolean; })[];
    }

    export namespace getLectureRelatedReviews {
        export const method = 'get', apiPath = '/api/lectures/:lectureId/related-reviews', authRequired = false;

        export type RequestParam = { lectureId: number };
        export type RequestBody = never;
        export type RequestQuery = { query: IReview.LectureReviewsQueryDto };
        export type ResponseBody = (IReview.Basic & { userspecific_is_liked: boolean; })[];
    }
}
