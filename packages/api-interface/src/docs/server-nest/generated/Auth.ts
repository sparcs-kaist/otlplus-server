import { IAuth } from "@otl/api-interface/src/interfaces";
import { IUser } from "@otl/api-interface/src/interfaces";

export namespace Auth {
    export namespace user_login {
        export const method = 'get', apiPath = '/session/login', authRequired = false;

        export type RequestParam = never;
        export type RequestBody = never;
        export type RequestQuery = { next: string; social_login: string };
        export type ResponseBody = never;
    }

    export namespace loginCallback {
        export const method = 'get', apiPath = '/session/login/callback', authRequired = false;

        export type RequestParam = never;
        export type RequestBody = never;
        export type RequestQuery = { state: string; code: string };
        export type ResponseBody = void;
    }

    export namespace getUserProfile {
        export const method = 'get', apiPath = '/session/info', authRequired = true;

        export type RequestParam = never;
        export type RequestBody = never;
        export type RequestQuery = never;
        export type ResponseBody = IUser.Profile;
    }

    export namespace home {
        export const method = 'get', apiPath = '/session//', authRequired = false;

        export type RequestParam = never;
        export type RequestBody = never;
        export type RequestQuery = never;
        export type ResponseBody = void;
    }

    export namespace logout {
        export const method = 'get', apiPath = '/session/logout', authRequired = false;

        export type RequestParam = never;
        export type RequestBody = never;
        export type RequestQuery = { next: string };
        export type ResponseBody = void;
    }
}
