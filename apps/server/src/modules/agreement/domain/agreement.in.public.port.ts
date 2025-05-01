import { AgreementType, UserAgreement } from '@otl/server-nest/modules/agreement/domain/UserAgreement'

export interface AgreementInPublicPort {
  // Get all agreements for a user
  findByUserId(userId: number): Promise<UserAgreement[] | null>

  // get agreement by userId and type
  findByUserIdAndType(userId: number, type: AgreementType): Promise<UserAgreement | null>
}
