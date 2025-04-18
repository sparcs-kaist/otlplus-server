import { Module } from '@nestjs/common'

import { PrismaModule } from '@otl/prisma-client/prisma.module'
import { RateRepository } from '@otl/prisma-client/repositories'

import { RatesController } from './rates.controller'
import { RatesService } from './rates.service'

@Module({
  imports: [PrismaModule],
  controllers: [RatesController],
  providers: [RatesService, RateRepository],
})
export class RatesModule {}
