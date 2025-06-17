import { Inject, Injectable } from '@nestjs/common'
import { AgreementInPublicPort } from '@otl/server-nest/modules/agreement/domain/agreement.in.public.port'
import {
  AGREEMENT_REPOSITORY,
  AgreementRepository,
} from '@otl/server-nest/modules/agreement/domain/agreement.repository'
import { Agreement, UserAgreement, UserAgreementCreate } from '@otl/server-nest/modules/agreement/domain/UserAgreement'

import { AgreementType } from '@otl/common/enum/agreement'

@Injectable()
export class AgreementPublicService implements AgreementInPublicPort {
  constructor(
    @Inject(AGREEMENT_REPOSITORY)
    protected readonly agreementRepository: AgreementRepository,
  ) {}

  async findByUserId(userId: number): Promise<UserAgreement[] | null> {
    return await this.agreementRepository.findByUserId(userId)
  }

  async findByUserIdAndType(userId: number, type: AgreementType): Promise<UserAgreement | null> {
    return await this.agreementRepository.findByUserIdAndType(userId, type)
  }

  async initialize(userId: number): Promise<UserAgreement[]> {
    const agreements = await this.agreementRepository.findByUserId(userId)
    const haveAllAgreements = agreements?.length === Object.values(AgreementType).length
    if (!haveAllAgreements) {
      const agreementTypes = Object.values(AgreementType)
      const agreementList: UserAgreementCreate[] = []
      agreementTypes.forEach((type) => {
        const agreement = new UserAgreement()
        agreement.userId = userId
        agreement.agreementType = type
        agreement.agreementStatus = false
        agreement.modal = true
        agreementList.push(agreement)
      })
      return await this.agreementRepository.upsertMany(agreementList)
    }
    return agreements
  }

  async getAllAgreements(): Promise<Agreement[]> {
    return await this.agreementRepository.getAllAgreementTypes()
  }
}
