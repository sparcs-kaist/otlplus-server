import { UserAgreement } from '@otl/server-nest/modules/agreement/domain/UserAgreement'

import { AgreementType } from '@otl/common/enum/agreement'

export interface AgreementInPrivatePort {
  // update modal set
  toggleModal(id: number, mode: boolean): Promise<UserAgreement>

  // allow Agreement
  allow(userId: number, agreementType: AgreementType): Promise<UserAgreement>

  // disAllow Agreement
  disallow(userId: number, agreementType: AgreementType): Promise<UserAgreement>
}
