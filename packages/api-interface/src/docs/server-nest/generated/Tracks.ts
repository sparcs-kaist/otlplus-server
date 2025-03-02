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

export namespace Tracks {
    export namespace getTracks {
        export const method = 'get', apiPath = '//api/tracks/', authRequired = false;

        export type RequestParam = never;
        export type RequestBody = never;
        export type RequestQuery = never;
        export type ResponseBody = { general: IPlanner.ITrack.General[]; major: IPlanner.ITrack.Major[]; additional: IPlanner.ITrack.Additional[]; };
    }
}
