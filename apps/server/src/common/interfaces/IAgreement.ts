import { AgreementType } from '@otl/server-nest/modules/agreement/domain/UserAgreement'
import { IsIn, IsNotEmpty, IsOptional } from 'class-validator'

export namespace IAgreement {
  export class AgreementQueryDto {
    @IsOptional()
    modal?: boolean

    @IsOptional()
    agreementStatus?: boolean

    @IsOptional()
    agreementType?: string
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
