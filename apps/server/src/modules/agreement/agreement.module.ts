import { Module } from '@nestjs/common'
import { AgreementController } from '@otl/server-nest/modules/agreement/agreement.controller'
import { AgreementPrivateService } from '@otl/server-nest/modules/agreement/agreement.private.service'
import { AgreementPublicService } from '@otl/server-nest/modules/agreement/agreement.public.service'
import {
  AGREEMENT_IN_PORT,
  AGREEMENT_IN_PUBLIC_PORT,
} from '@otl/server-nest/modules/agreement/domain/agreement.in.port'
import { AGREEMENT_REPOSITORY } from '@otl/server-nest/modules/agreement/domain/agreement.repository'

import { PrismaModule } from '@otl/prisma-client'
import { AgreementPrismaRepository } from '@otl/prisma-client/repositories/agreement.repository'

@Module({
  imports: [PrismaModule],
  providers: [
    {
      provide: AGREEMENT_REPOSITORY,
      useClass: AgreementPrismaRepository,
    },
    {
      provide: AGREEMENT_IN_PORT,
      useFactory: (agreementRepository) => new AgreementPrivateService(agreementRepository),
      inject: [AGREEMENT_REPOSITORY],
    },
    {
      provide: AGREEMENT_IN_PUBLIC_PORT,
      useFactory: (agreementRepository) => new AgreementPublicService(agreementRepository),
      inject: [AGREEMENT_REPOSITORY],
    },
  ],
  exports: [AGREEMENT_IN_PUBLIC_PORT],
  controllers: [AgreementController],
})
export class AgreementModule {}
