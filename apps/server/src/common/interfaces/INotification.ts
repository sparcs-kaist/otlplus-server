import { IsIn, IsNotEmpty } from 'class-validator'

import { AgreementType } from '@otl/common/enum/agreement'

export namespace INotification {
  export class ReadDto {
    @IsNotEmpty()
    requestUUID!: string
  }
  export class ActiveDto {
    @IsNotEmpty()
    active!: boolean

    @IsNotEmpty()
    notificationType!: string
  }

  export class CreateDto {
    @IsNotEmpty()
    name!: string

    @IsNotEmpty()
    description!: string

    @IsIn(Object.values(AgreementType))
    @IsNotEmpty()
    agreementType!: AgreementType
  }

  export class UpdateDto {
    @IsNotEmpty()
    id!: number

    @IsNotEmpty()
    name!: string

    @IsNotEmpty()
    description!: string

    @IsIn(Object.values(AgreementType))
    @IsNotEmpty()
    agreementType!: AgreementType
  }

  export class DeleteDto {
    @IsNotEmpty()
    id!: number
  }
}
