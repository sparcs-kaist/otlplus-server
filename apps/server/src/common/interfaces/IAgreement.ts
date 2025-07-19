import {
  IsBoolean, IsIn, IsNotEmpty, IsOptional,
} from 'class-validator'

import { AgreementType } from '@otl/common/enum/agreement'

export namespace IAgreement {
  export class AgreementQueryDto {
    @IsOptional()
    modal?: boolean

    @IsOptional()
    agreementStatus?: boolean

    @IsOptional()
    agreementType?: string
  }

  export class AgreementModalQueryDto {
    @IsOptional()
    @IsBoolean()
    modal!: boolean
  }

  export interface Response {
    agreementId: number
    agreementType: AgreementType
    agreementStatus: boolean
    modal: boolean
  }

  export class AgreementAllowDto {
    @IsNotEmpty()
    allow!: boolean

    @IsIn(Object.values(AgreementType))
    @IsNotEmpty()
    agreementType!: AgreementType
  }

  export class AgreementToggleDto {
    @IsIn(Object.values(AgreementType))
    @IsNotEmpty()
    agreementType!: AgreementType

    @IsNotEmpty()
    modal!: boolean
  }
}
