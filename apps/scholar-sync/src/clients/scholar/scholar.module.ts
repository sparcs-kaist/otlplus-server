import { PrismaModule } from '@otl/scholar-sync/prisma/prisma.module';
import { Module } from '@nestjs/common';
import { ScholarApiClient } from './scholar.api.client';

@Module({
  providers: [ScholarApiClient],
  imports: [PrismaModule],
  exports: [ScholarApiClient],
})
export class ScholarModule {}
