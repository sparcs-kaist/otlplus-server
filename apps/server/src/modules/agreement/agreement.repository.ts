import { Agreement, AgreementType } from '@otl/server-nest/modules/agreement/domain/Agreement'

export interface AgreementRepository {
  // Get all agreements for a user
  findByUserId(userId: number): Promise<Agreement | null>

  // get agreement by userId and type
  findByUserIdAndType(userId: number, type: AgreementType): Promise<Agreement | null>

  // update
  update(agreement: Agreement): Promise<Agreement>

  // insert
  insert(agreement: Agreement): Promise<Agreement>

  // upsert
  upsert(agreement: Agreement): Promise<Agreement>

  // delete
  delete(agreement: Agreement): Promise<Agreement>
}
