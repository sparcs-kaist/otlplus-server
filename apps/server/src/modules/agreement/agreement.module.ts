import { Module } from '@nestjs/common'
import { AgreementController } from '@otl/server-nest/modules/agreement/agreement.controller'
import { AgreementPrivateService } from '@otl/server-nest/modules/agreement/agreement.private.service'
import { AgreementPublicService } from '@otl/server-nest/modules/agreement/agreement.public.service'
import {
  AgreementInPortSymbol,
  AgreementInPublicPortSymbol,
} from '@otl/server-nest/modules/agreement/domain/agreement.in.port'

import { PrismaModule } from '@otl/prisma-client'
import { AgreementPrismaRepository } from '@otl/prisma-client/repositories/agreement.repository'

@Module({
  imports: [PrismaModule],
  providers: [
    AgreementPrismaRepository,
    {
      provide: AgreementInPortSymbol,
      useFactory: (agreementPrismaRepository) => new AgreementPrivateService(agreementPrismaRepository),
      inject: [AgreementPrismaRepository],
    },
    {
      provide: AgreementInPublicPortSymbol,
      useFactory: (agreementPrismaRepository) => new AgreementPublicService(agreementPrismaRepository),
      inject: [AgreementPrismaRepository],
    },
  ],
  exports: [AgreementInPublicPortSymbol],
  controllers: [AgreementController],
})
export class AgreementModule {}
