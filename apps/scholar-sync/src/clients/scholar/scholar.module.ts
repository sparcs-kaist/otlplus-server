import { Module } from '@nestjs/common'

import { PrismaModule } from '@otl/prisma-client/prisma.module'

import { ScholarApiClient } from './scholar.api.client'

@Module({
  providers: [ScholarApiClient],
  imports: [PrismaModule],
  exports: [ScholarApiClient],
})
export class ScholarModule {}
