import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { RateRepository } from 'src/prisma/repositories/rates.repository';
import { RatesController } from './rates.controller';
import { RatesService } from './rates.service';

@Module({
  controllers: [RatesController],
  providers: [RatesService, RateRepository, PrismaService],
})
export class RatesModule {}
