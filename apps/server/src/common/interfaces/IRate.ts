import { Type } from 'class-transformer'
import { IsNumber, Max, Min } from 'class-validator'

export namespace IRate {
  export interface Basic {
    id: number
    user_id: number
    score: number
    version: string
    created_datetime: Date | null
  }

  export class CreateDto {
    @IsNumber()
    @Max(5)
    @Min(1)
    @Type(() => Number)
    score!: number
  }
}
