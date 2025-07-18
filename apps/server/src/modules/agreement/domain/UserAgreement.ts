import { AgreementType } from '@otl/common/enum/agreement'

export class Agreement {
  id!: number

  agreementType!: AgreementType
}

export class UserAgreement {
  id!: number

  agreementId!: number

  userId!: number

  agreementType!: AgreementType

  agreementStatus!: boolean

  modal!: boolean
}

export type UserAgreementCreate = Omit<UserAgreement, 'id' | 'agreementId'>
