import { AgreementType, UserAgreement } from '@otl/server-nest/modules/agreement/domain/UserAgreement'

export interface AgreementInPrivatePort {
  // update modal set
  toggleModal(id: number, mode: boolean): Promise<UserAgreement>

  // allow Agreement
  allow(userId: number, agreementType: AgreementType): Promise<UserAgreement>

  // disAllow Agreement
  disallow(userId: number, agreementType: AgreementType): Promise<UserAgreement>

  // create default Agreement setting for user
  initialize(userId: number): Promise<UserAgreement[]>
}
