import { Module } from '@nestjs/common'

import { PrismaModule } from '@otl/prisma-client/prisma.module'

import { DepartmentsControllerV2 } from './departments.v2.controller'
import { DepartmentsServiceV2 } from './departments.v2.service'

@Module({
  imports: [PrismaModule],
  controllers: [DepartmentsControllerV2],
  providers: [DepartmentsServiceV2],
  exports: [DepartmentsServiceV2],
})
export class DepartmentsModuleV2 {}
