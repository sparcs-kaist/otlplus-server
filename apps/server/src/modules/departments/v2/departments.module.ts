import { Module } from '@nestjs/common'

import { PrismaModule } from '@otl/prisma-client/prisma.module'

import { DepartmentsControllerV2 } from './departments.controller'
import { DepartmentsServiceV2 } from './departments.service'

@Module({
  imports: [PrismaModule],
  controllers: [DepartmentsControllerV2],
  providers: [DepartmentsServiceV2],
  exports: [DepartmentsServiceV2],
})
export class DepartmentsModuleV2 {}
