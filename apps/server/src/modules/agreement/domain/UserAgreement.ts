export const AgreementType = {
  INFO: 'INFO',
  MARKETING: 'MARKETING',
  NIGHT_MARKETING: 'NIGHT_MARKETING',
} as const

export type AgreementType = (typeof AgreementType)[keyof typeof AgreementType]

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
