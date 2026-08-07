import {
  Body, Controller, Get, Inject, Patch, Query,
} from '@nestjs/common'
import { GetUser } from '@otl/server-nest/common/decorators/get-user.decorator'
import { IAgreement } from '@otl/server-nest/common/interfaces/IAgreement'
import { AGREEMENT_IN_PORT, AgreementInPort } from '@otl/server-nest/modules/agreement/domain/agreement.in.port'
import { session_userprofile } from '@prisma/client'

import { AgreementType } from '@otl/common/enum/agreement'

@Controller('agreement')
export class AgreementController {
  constructor(
    @Inject(AGREEMENT_IN_PORT)
    private readonly agreementService: AgreementInPort,
  ) {}

  @Get('user')
  public async getUserAgreement(
    @GetUser() user: session_userprofile,
    @Query() queryDto: IAgreement.AgreementModalQueryDto,
  ): Promise<IAgreement.Response[]> {
    const agreements = await this.agreementService.findByUserId(user.id)
    const response = agreements?.length === Object.values(AgreementType).length
      ? agreements
      : await this.agreementService.initialize(user.id)
    const { modal } = queryDto

    return modal ? response.filter((e) => e.modal === modal) : response
  }

  @Patch('user/modal')
  public async toggleModal(
    @GetUser() user: session_userprofile,
    @Body() toggleDto: IAgreement.AgreementToggleDto,
  ): Promise<IAgreement.Response> {
    const { modal, agreementType } = toggleDto
    const agreement = await this.agreementService.findByUserIdAndType(user.id, agreementType)
    const response = agreement ?? (await this.agreementService.initialize(user.id)).filter((e) => e.agreementType === agreementType)[0]
    return this.agreementService.toggleModal(response.id, modal)
  }

  @Patch('user')
  public async allowOrDisAllow(
    @GetUser() user: session_userprofile,
    @Body() allowDto: IAgreement.AgreementAllowDto,
  ): Promise<IAgreement.Response> {
    if (allowDto.allow) {
      return this.agreementService.allow(user.id, allowDto.agreementType)
    }
    return this.agreementService.disallow(user.id, allowDto.agreementType)
  }
}
