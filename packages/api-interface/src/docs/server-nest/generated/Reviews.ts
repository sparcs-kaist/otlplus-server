import { IAuth } from "@otl/api-interface/src/interfaces";
import { IUser } from "@otl/api-interface/src/interfaces";
import { ICourse } from "@otl/api-interface/src/interfaces";
import { ILecture } from "@otl/api-interface/src/interfaces";
import { IReview } from "@otl/api-interface/src/interfaces";
import { IFeed } from "@otl/api-interface/src/interfaces";
import { INotice } from "@otl/api-interface/src/interfaces";
import { IPlanner } from "@otl/api-interface/src/interfaces/IPlanner";
import { IRate } from "@otl/api-interface/src/interfaces/IRate";

export namespace Reviews {
    export namespace getReviews {
        export const method = 'get', apiPath = '/api/reviews/', authRequired = false;

        export type RequestParam = never;
        export type RequestBody = never;
        export type RequestQuery = { reviewsParam: IReview.QueryDto };
        export type ResponseBody = number | (IReview.Basic & { userspecific_is_liked: boolean; })[];
    }

    export namespace createReviews {
        export const method = 'post', apiPath = '/api/reviews/', authRequired = true;

        export type RequestParam = never;
        export type RequestBody = { reviewsBody: IReview.CreateDto };
        export type RequestQuery = never;
        export type ResponseBody = IReview.Basic & { userspecific_is_liked: boolean; };
    }

    export namespace getReviewInstance {
        export const method = 'get', apiPath = '/api/reviews/:reviewId', authRequired = false;

        export type RequestParam = { reviewId: number };
        export type RequestBody = never;
        export type RequestQuery = never;
        export type ResponseBody = IReview.Basic & { userspecific_is_liked: boolean; };
    }

    export namespace updateReviewInstance {
        export const method = 'patch', apiPath = '/api/reviews/:reviewId', authRequired = true;

        export type RequestParam = { reviewId: number };
        export type RequestBody = { reviewsBody: IReview.UpdateDto };
        export type RequestQuery = never;
        export type ResponseBody = IReview.Basic & { userspecific_is_liked: boolean; };
    }

    export namespace likeReviewInstance {
        export const method = 'post', apiPath = '/api/reviews/:reviewId/like', authRequired = true;

        export type RequestParam = { reviewId: number };
        export type RequestBody = never;
        export type RequestQuery = never;
        export type ResponseBody = IReviewVote.Basic;
    }
}
