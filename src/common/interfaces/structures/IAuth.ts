import { Request, Response } from 'express';

export namespace IAuth {
  export type IRequest = Request & IRequestExtra;

  export interface IRequestExtra {
    session: {
      next: string;

      sso_state: string;
    };
  }

  export interface IResponse extends Response {}

  export interface IJwtPayload {
    sid: string;
  }
}
