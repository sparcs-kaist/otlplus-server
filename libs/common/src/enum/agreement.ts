export const AgreementType = {
  INFO: 'INFO',
  MARKETING: 'MARKETING',
  NIGHT_MARKETING: 'NIGHT_MARKETING',
} as const
export type AgreementType = (typeof AgreementType)[keyof typeof AgreementType]
