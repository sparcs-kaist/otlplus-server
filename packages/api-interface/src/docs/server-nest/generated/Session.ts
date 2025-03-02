import { IAuth } from "@otl/api-interface/src/interfaces";
import { IUser } from "@otl/api-interface/src/interfaces";
import { ICourse } from "@otl/api-interface/src/interfaces";
import { ILecture } from "@otl/api-interface/src/interfaces";
import { IReview } from "@otl/api-interface/src/interfaces";
import { IFeed } from "@otl/api-interface/src/interfaces";
import { INotice } from "@otl/api-interface/src/interfaces";
import { IDepartment } from "@otl/api-interface/src/interfaces";
import { ISession } from "@otl/api-interface/src/interfaces";
import { IPlanner } from "@otl/api-interface/src/interfaces/IPlanner";
import { IRate } from "@otl/api-interface/src/interfaces/IRate";
import { ISemester } from "@otl/api-interface/src/interfaces/ISemester";

export namespace Session {
    export namespace departmentOptions {
        export const method = 'get', apiPath = '/session/department-options', authRequired = true;

        export type RequestParam = never;
        export type RequestBody = never;
        export type RequestQuery = never;
        export type ResponseBody = IDepartment.Basic[][];
    }

    export namespace favoriteDepartments {
        export const method = 'post', apiPath = '/session/favorite-departments', authRequired = true;

        export type RequestParam = never;
        export type RequestBody = { body: ISession.FavoriteDepartmentsDto };
        export type RequestQuery = never;
        export type ResponseBody = IUser.Basic;
    }
}
