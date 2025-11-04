import { Module } from '@nestjs/common'

import { PrismaModule } from '@otl/prisma-client/prisma.module'

import { SemestersControllerV2 } from './semesters.v2.controller'
import { SemestersServiceV2 } from './semesters.v2.service'

@Module({
  imports: [PrismaModule],
  controllers: [SemestersControllerV2],
  providers: [SemestersServiceV2],
  exports: [SemestersServiceV2],
})
export class SemestersModuleV2 {}
