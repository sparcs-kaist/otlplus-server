import {
  Agreement,
  AgreementType,
  UserAgreement,
  UserAgreementCreate,
} from '@otl/server-nest/modules/agreement/domain/UserAgreement'

export const AGREEMENT_REPOSITORY = Symbol('AGREEMENT_REPOSITORY')
export interface AgreementRepository {
  // get agreement by id
  findById(id: number): Promise<UserAgreement | null>

  // get agreement by agreementId
  getAllAgreementTypes(): Promise<Agreement[]>

  // Get all agreements for a user
  findByUserId(userId: number): Promise<UserAgreement[] | null>

  // get agreement by userId and type
  findByUserIdAndType(userId: number, type: AgreementType): Promise<UserAgreement | null>

  // update
  update(agreement: UserAgreement): Promise<UserAgreement>

  // update multiple
  updateMany(agreement: UserAgreement[]): Promise<UserAgreement[]>

  // insert
  insert(agreement: UserAgreementCreate): Promise<UserAgreement>

  // insert multiple
  insertMany(agreement: UserAgreementCreate[]): Promise<UserAgreement[]>

  // upsert
  upsert(agreement: UserAgreementCreate): Promise<UserAgreement>

  // upsert multiple
  upsertMany(agreement: UserAgreementCreate[]): Promise<UserAgreement[]>

  // delete
  delete(agreement: UserAgreement): Promise<UserAgreement>

  // delete multiple
  deleteMany(agreement: UserAgreement[]): Promise<UserAgreement[]>
}
