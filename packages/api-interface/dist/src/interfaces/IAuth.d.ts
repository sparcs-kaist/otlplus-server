import { Request as _Request, Response as _Response } from 'express';
export declare namespace IAuth {
  type Request = _Request & RequestExtra;
  interface RequestExtra {
    session: {
      next: string;
      sso_state: string;
    };
  }
  type Response = _Response;
  interface JwtPayload {
    sid: string;
  }
}
