import { IAuth } from "@otl/api-interface/src/interfaces";
import { IUser } from "@otl/api-interface/src/interfaces";
import { ICourse } from "@otl/api-interface/src/interfaces";
import { ILecture } from "@otl/api-interface/src/interfaces";
import { IReview } from "@otl/api-interface/src/interfaces";
import { IFeed } from "@otl/api-interface/src/interfaces";
import { INotice } from "@otl/api-interface/src/interfaces";
import { IPlanner } from "@otl/api-interface/src/interfaces/IPlanner";

export namespace Planners {
    export namespace getPlanners {
        export const method = 'get', apiPath = '/api/users/:id/planners/', authRequired = true;

        export type RequestParam = { id: number };
        export type RequestBody = never;
        export type RequestQuery = { query: IPlanner.QueryDto };
        export type ResponseBody = IPlanner.Detail[];
    }

    export namespace updatePlanner {
        export const method = 'patch', apiPath = '/api/users/:id/planners/:plannerId', authRequired = true;

        export type RequestParam = { plannerId: number };
        export type RequestBody = { planner: IPlanner.UpdateBodyDto };
        export type RequestQuery = never;
        export type ResponseBody = IPlanner.Detail;
    }

    export namespace deletePlanner {
        export const method = 'delete', apiPath = '/api/users/:id/planners/:plannerId', authRequired = true;

        export type RequestParam = { plannerId: number };
        export type RequestBody = never;
        export type RequestQuery = never;
        export type ResponseBody = { message: string; };
    }

    export namespace postPlanner {
        export const method = 'post', apiPath = '/api/users/:id/planners/', authRequired = true;

        export type RequestParam = { id: number };
        export type RequestBody = { planner: IPlanner.CreateBodyDto };
        export type RequestQuery = never;
        export type ResponseBody = IPlanner.Detail;
    }

    export namespace addArbitraryItem {
        export const method = 'post', apiPath = '/api/users/:id/planners/:plannerId/add-arbitrary-item', authRequired = true;

        export type RequestParam = { id: number; plannerId: number };
        export type RequestBody = { item: IPlanner.AddArbitraryItemDto };
        export type RequestQuery = never;
        export type ResponseBody = IPlanner.IItem.Arbitrary;
    }

    export namespace removePlanner {
        export const method = 'post', apiPath = '/api/users/:id/planners/:plannerId/remove-item', authRequired = true;

        export type RequestParam = { plannerId: number };
        export type RequestBody = { removeItem: IPlanner.RemoveItemBodyDto };
        export type RequestQuery = never;
        export type ResponseBody = IPlanner.Detail;
    }

    export namespace addFutureItem {
        export const method = 'post', apiPath = '/api/users/:id/planners/:plannerId/add-future-item', authRequired = true;

        export type RequestParam = { id: number; plannerId: number };
        export type RequestBody = { item: IPlanner.FuturePlannerItemDto };
        export type RequestQuery = never;
        export type ResponseBody = IPlanner.IItem.Future;
    }

    export namespace reorderPlanner {
        export const method = 'post', apiPath = '/api/users/:id/planners/:plannerId/reorder', authRequired = true;

        export type RequestParam = { plannerId: number };
        export type RequestBody = { reorder: IPlanner.ReorderBodyDto };
        export type RequestQuery = never;
        export type ResponseBody = IPlanner.Detail;
    }

    export namespace updatePlannerItem {
        export const method = 'post', apiPath = '/api/users/:id/planners/:plannerId/update-item', authRequired = true;

        export type RequestParam = { id: number; plannerId: number };
        export type RequestBody = { updateItemDto: IPlanner.UpdateItemBodyDto };
        export type RequestQuery = never;
        export type ResponseBody = IPlanner.IItem.Arbitrary | IPlanner.IItem.Future | IPlanner.IItem.Taken;
    }
}
