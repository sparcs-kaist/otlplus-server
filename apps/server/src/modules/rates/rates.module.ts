import { Module } from '@nestjs/common';
import { RatesController } from './rates.controller';
import { RatesService } from './rates.service';
import { PrismaModule } from '@otl/prisma-client/prisma.module';
import { RateRepository } from '@otl/prisma-client/repositories';

@Module({
  imports: [PrismaModule],
  controllers: [RatesController],
  providers: [RatesService, RateRepository],
})
export class RatesModule {}
