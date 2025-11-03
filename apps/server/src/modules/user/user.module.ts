import { Module } from '@nestjs/common'

import { PrismaModule } from '@otl/prisma-client/prisma.module'

import { UserController } from './user.controller'
import { UserService } from './user.service'
import { UserV2Controller } from './v2/user.v2.controller'
import { UserV2Service } from './v2/user.v2.service'

@Module({
  imports: [PrismaModule],
  controllers: [UserController, UserV2Controller],
  providers: [UserService, UserV2Service],
})
export class UserModule {}
