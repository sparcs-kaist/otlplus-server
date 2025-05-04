import { Inject, Injectable } from '@nestjs/common'
import { AgreementInPublicPort } from '@otl/server-nest/modules/agreement/domain/agreement.in.public.port'
import {
  AGREEMENT_REPOSITORY,
  AgreementRepository,
} from '@otl/server-nest/modules/agreement/domain/agreement.repository'
import { UserAgreement } from '@otl/server-nest/modules/agreement/domain/UserAgreement'

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
}
