import { Module } from '@nestjs/common';
import { ScholarApiClient } from './scholar.api.client';
import { PrismaModule } from '@otl/prisma-client/prisma.module';

@Module({
  providers: [ScholarApiClient],
  imports: [PrismaModule],
  exports: [ScholarApiClient],
})
export class ScholarModule {}
