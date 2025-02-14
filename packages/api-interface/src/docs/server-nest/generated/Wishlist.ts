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
import { IWishlist } from "@otl/api-interface/src/interfaces/IWishlist";

export namespace Wishlist {
    export namespace getWishlist {
        export const method = 'get', apiPath = '/api/users/:userId/wishlist/', authRequired = true;

        export type RequestParam = { userId: number };
        export type RequestBody = never;
        export type RequestQuery = never;
        export type ResponseBody = IWishlist.WithLectures;
    }

    export namespace addLecture {
        export const method = 'post', apiPath = '/api/users/:userId/wishlist/add-lecture', authRequired = true;

        export type RequestParam = { userId: number };
        export type RequestBody = { body: IWishlist.AddLectureDto };
        export type RequestQuery = never;
        export type ResponseBody = IWishlist.WithLectures;
    }

    export namespace removeLecture {
        export const method = 'post', apiPath = '/api/users/:userId/wishlist/remove-lecture', authRequired = true;

        export type RequestParam = { userId: number };
        export type RequestBody = { body: IWishlist.RemoveLectureDto };
        export type RequestQuery = never;
        export type ResponseBody = IWishlist.WithLectures;
    }
}
