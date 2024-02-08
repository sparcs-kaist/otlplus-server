import { IsString } from 'class-validator';

export namespace ISession {
  export class FavoriteDepartmentsDTO {
    @IsString({ each: true })
    fav_department!: string[];
  }
}
