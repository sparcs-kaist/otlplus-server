import { Module } from '@nestjs/common'

import { PrismaModule } from '@otl/prisma-client/prisma.module'
import {
  DepartmentRepository,
  LectureRepository,
  ReviewsRepository,
  UserRepositoryV2,
} from '@otl/prisma-client/repositories'

import { v2UserController } from './user.v2.controller'
import { userV2Service } from './user.v2.service'

@Module({
  imports: [PrismaModule],
  controllers: [v2UserController],
  providers: [userV2Service, UserRepositoryV2, LectureRepository, DepartmentRepository, ReviewsRepository],
})
export class v2UserModule {}
