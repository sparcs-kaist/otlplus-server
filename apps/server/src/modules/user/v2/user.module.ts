import { Module } from '@nestjs/common'

import { PrismaModule } from '@otl/prisma-client/prisma.module'

import { UserControllerV2 } from './user.controller'
import { UserServiceV2 } from './user.service'

@Module({
  imports: [PrismaModule],
  controllers: [UserControllerV2],
  providers: [UserServiceV2],
  exports: [UserServiceV2],
})
export class UserModuleV2 {}
