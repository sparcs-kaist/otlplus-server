import { Agreement, AgreementType } from '@otl/server-nest/modules/agreement/domain/Agreement'

export interface AgreementUseCase {
  // Get all agreements for a user
  findByUserId(userId: number): Promise<Agreement[] | null>

  // get agreement by userId and type
  findByUserIdAndType(userId: number, type: AgreementType): Promise<Agreement | null>

  // update modal set
  toggleModal(id: number, mode: boolean): Promise<boolean>

  // allow Agreement
  allow(userId: number, agreementType: AgreementType): Promise<Agreement>

  // disAllow Agreement
  disallow(userId: number, agreementType: AgreementType): Promise<Agreement>

  // create default Agreement setting for user
  initialize(): Promise<void>
}
