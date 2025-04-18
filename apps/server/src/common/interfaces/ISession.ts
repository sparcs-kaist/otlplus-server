import { IsString } from 'class-validator'

export namespace ISession {
  export class FavoriteDepartmentsDto {
    @IsString({ each: true })
    fav_department!: string[]
  }
}
