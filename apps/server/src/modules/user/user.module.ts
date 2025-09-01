import { Module } from '@nestjs/common'

import { LectureRepository, WishlistRepository } from '@otl/prisma-client'
import { PrismaModule } from '@otl/prisma-client/prisma.module'

import { LecturesService } from '../lectures/lectures.service'
import { UserController, UserV2Controller } from './user.controller'
import { UserService } from './user.service'

@Module({
  imports: [PrismaModule],
  controllers: [UserController, UserV2Controller],
  providers: [UserService, LecturesService, LectureRepository, WishlistRepository],
})
export class UserModule {}
