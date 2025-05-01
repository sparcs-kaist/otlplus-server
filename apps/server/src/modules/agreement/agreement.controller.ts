import { Controller, Get, Patch } from '@nestjs/common'
import { AgreementType } from '@otl/server-nest/modules/agreement/domain/Agreement'
import { AgreementUseCase } from '@otl/server-nest/modules/agreement/domain/agreement.usecase'

@Controller('agreement')
export class AgreementController {
  constructor(private readonly agreementUseCase: AgreementUseCase) {}

  @Get('user/:userId')
  public async getUserAgreement(userId: number) {
    return await this.agreementUseCase.findByUserId(userId)
  }

  @Patch('user/:userId/:agreementType')
  public async allowOrDisAllow(userId: number, agreementType: AgreementType, allow: boolean) {
    if (allow) {
      this.agreementUseCase.allow(userId, agreementType)
    }
    else {
      this.agreementUseCase.disallow(userId, agreementType)
    }
  }
}
