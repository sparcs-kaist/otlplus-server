import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { RateRepository } from 'src/prisma/repositories/rates.repository';
import { RatesController } from './rates.controller';
import { RatesService } from './rates.service';

@Module({
  imports: [PrismaModule],
  controllers: [RatesController],
  providers: [RatesService, RateRepository],
})
export class RatesModule {}
