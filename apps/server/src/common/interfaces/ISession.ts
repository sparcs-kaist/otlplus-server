import { IsString, Matches } from 'class-validator'

export namespace ISession {
  export class FavoriteDepartmentsDto {
    @IsString({ each: true })
    fav_department!: string[]
  }

  export class SessionSignupDto {
    @IsString()
    ssoJwt!: string // ssoinfo JWT 토큰 문자열
  }

  export class SessionSignupRequestDto {
    @IsString()
    @Matches(/^Bearer\s+.+$/i, { message: 'Authorization must be "Bearer <token>"' })
    authorization!: string
  }
}
