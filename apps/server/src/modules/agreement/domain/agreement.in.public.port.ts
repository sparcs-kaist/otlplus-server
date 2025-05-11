import { UserAgreement } from '@otl/server-nest/modules/agreement/domain/UserAgreement'

import { AgreementType } from '@otl/common/enum/agreement'

export interface AgreementInPublicPort {
  // Get all agreements for a user
  findByUserId(userId: number): Promise<UserAgreement[] | null>

  // get agreement by userId and type
  findByUserIdAndType(userId: number, type: AgreementType): Promise<UserAgreement | null>

  // create default Agreement setting for user
  initialize(userId: number): Promise<UserAgreement[]>
}
