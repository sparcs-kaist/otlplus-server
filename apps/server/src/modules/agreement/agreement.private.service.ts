import { Inject, Injectable } from '@nestjs/common'
import { AgreementPublicService } from '@otl/server-nest/modules/agreement/agreement.public.service'
import { AgreementInPrivatePort } from '@otl/server-nest/modules/agreement/domain/agreement.in.private.port'
import { AgreementInPublicPort } from '@otl/server-nest/modules/agreement/domain/agreement.in.public.port'
import {
  AGREEMENT_REPOSITORY,
  AgreementRepository,
} from '@otl/server-nest/modules/agreement/domain/agreement.repository'
import { UserAgreement } from '@otl/server-nest/modules/agreement/domain/UserAgreement'
import { StatusCodes } from 'http-status-codes'

import { getCurrentMethodName } from '@otl/common'
import { AgreementType } from '@otl/common/enum/agreement'
import { OtlException } from '@otl/common/exception/otl.exception'

@Injectable()
export class AgreementPrivateService
  extends AgreementPublicService
  implements AgreementInPublicPort, AgreementInPrivatePort {
  constructor(
    @Inject(AGREEMENT_REPOSITORY)
    protected readonly agreementRepository: AgreementRepository,
  ) {
    super(agreementRepository)
  }

  async allow(userId: number, agreementType: AgreementType): Promise<UserAgreement> {
    const agreement = await this.agreementRepository.findByUserIdAndType(userId, agreementType)
    if (agreement) {
      agreement.agreementStatus = true
      agreement.modal = false
      return await this.agreementRepository.update(agreement)
    }
    const agreements = await this.initialize(userId)
    const allowAgreement = agreements.find((e) => e.agreementType === agreementType)
    if (allowAgreement) {
      allowAgreement.agreementStatus = true
      allowAgreement.modal = false
      return await this.agreementRepository.update(allowAgreement)
    }
    throw new OtlException(StatusCodes.INTERNAL_SERVER_ERROR, 'should not reach here', getCurrentMethodName())
  }

  async disallow(userId: number, agreementType: AgreementType): Promise<UserAgreement> {
    const agreement = await this.agreementRepository.findByUserIdAndType(userId, agreementType)
    if (agreement) {
      agreement.agreementStatus = false
      agreement.modal = false
      return await this.agreementRepository.update(agreement)
    }
    const agreements = await this.initialize(userId)
    const disallowAgreement = agreements.find((e) => e.agreementType === agreementType)
    if (disallowAgreement) {
      disallowAgreement.agreementStatus = false
      disallowAgreement.modal = false
      return await this.agreementRepository.update(disallowAgreement)
    }
    throw new OtlException(StatusCodes.INTERNAL_SERVER_ERROR, 'should not reach here', getCurrentMethodName())
  }

  async toggleModal(id: number, mode: boolean): Promise<UserAgreement> {
    const agreement = await this.agreementRepository.findById(id)
    if (agreement) {
      agreement.modal = mode
      return await this.agreementRepository.update(agreement)
    }
    throw new OtlException(StatusCodes.NOT_FOUND, 'No Agreement with that Id', getCurrentMethodName())
  }

  findByUserId(userId: number): Promise<UserAgreement[] | null> {
    return super.findByUserId(userId)
  }

  findByUserIdAndType(userId: number, type: AgreementType): Promise<UserAgreement | null> {
    return super.findByUserIdAndType(userId, type)
  }
}
