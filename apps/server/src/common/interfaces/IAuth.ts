import { IsString } from 'class-validator'
import { Request as _Request, Response as _Response } from 'express'

import { ESSOUser } from '@otl/prisma-client/entities/ESSOUser'

export namespace IAuth {
  export type Request = _Request & RequestExtra

  export interface RequestExtra {
    session: {
      next: string

      sso_state: string
    }
  }

  // SSO 토큰(payload)에서 들어올 수 있는 필드들의 예시 타입
  export type SsoPayload = {
    uid: string
    email?: string | null
    first_name?: string | null
    last_name?: string | null
    kaist_id?: string | null
    kaist_info?: Partial<ESSOUser.KaistInfo> | null
    kaist_v2_info?: OneAppSsoPayload['kaist_v2_info'] & { std_prog_code?: string | number | null } | null
    iat?: number
    exp?: number
    iss?: string
    // … 기타 필드는 무시
  }

  export type ExtractedIdentity = {
    sid?: string
    uid?: string
    payload?: unknown
  }

  export type OneAppHeaderPayload = {
    oid: string
    uid: string
    type: string
    iat?: number
    exp?: number
    iss?: string
    aud?: string
  }

  export type OneAppSsoPayload = {
    uid: string
    email?: string | null
    first_name?: string | null
    last_name?: string | null
    kaist_id?: string | null
    kaist_v2_info?: {
      std_no?: string | null
      std_dept_id?: string | number | null
      std_status_kor?: string | null
    } | null
    iat?: number
    exp?: number
    iss?: string
    aud?: string
  }

  export type Response = _Response

  export interface JwtPayload {
    sid: string
  }

  export class TokenDto {
    @IsString()
    token!: string
  }

  export interface TokenResponse {
    accessToken: string
    refreshToken: string
  }
}
