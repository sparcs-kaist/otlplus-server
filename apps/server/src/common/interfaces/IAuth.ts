import { Request as _Request, Response as _Response } from 'express'

export namespace IAuth {
  export type Request = _Request & RequestExtra

  export interface RequestExtra {
    session: {
      next: string

      sso_state: string
    }
  }

  export type Response = _Response

  export interface JwtPayload {
    sid: string
  }

  export class TokenDto {
    token!: string
  }

  export interface TokenResponse {
    accessToken: string
    refreshToken: string
  }
}
