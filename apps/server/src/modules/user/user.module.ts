import { Module } from '@nestjs/common'

import { PrismaModule } from '@otl/prisma-client/prisma.module'
import { DepartmentRepository, UserRepositoryV2 } from '@otl/prisma-client/repositories'

import { UserController } from './user.controller'
import { UserService } from './user.service'
import { UserControllerV2 } from './v2/user.controller'
import { UserServiceV2 } from './v2/user.service'

@Module({
  imports: [PrismaModule],
  controllers: [UserController, UserControllerV2],
  providers: [UserService, UserServiceV2, UserRepositoryV2, DepartmentRepository],
})
export class UserModule {}
