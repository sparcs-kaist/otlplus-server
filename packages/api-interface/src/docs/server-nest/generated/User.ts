import { IAuth } from "@otl/api-interface/src/interfaces";
import { IUser } from "@otl/api-interface/src/interfaces/IUser";
import { ICourse } from "@otl/api-interface/src/interfaces";
import { ILecture } from "@otl/api-interface/src/interfaces";
import { IReview } from "@otl/api-interface/src/interfaces/IReview";
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

export namespace User {
    export namespace getUserTakenCourses {
        export const method = 'get', apiPath = '/api/users/:user_id/taken-courses', authRequired = true;

        export type RequestParam = { user_id: number };
        export type RequestBody = never;
        export type RequestQuery = { query: IUser.TakenCoursesQueryDto };
        export type ResponseBody = ICourse.DetailWithIsRead[];
    }

    export namespace getUserLikedReviews {
        export const method = 'get', apiPath = '/api/users/:user_id/liked-reviews', authRequired = true;

        export type RequestParam = { user_id: number };
        export type RequestBody = never;
        export type RequestQuery = { query: IUser.ReviewLikedQueryDto };
        export type ResponseBody = (IReview.Basic & { userspecific_is_liked: boolean; })[];
    }
}
