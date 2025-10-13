import { Module } from '@nestjs/common'

import { PrismaModule } from '@otl/prisma-client/prisma.module'

import { v2UserController } from './user.v2.controller'
import { v2UserService } from './user.v2.service'

@Module({
  imports: [PrismaModule],
  controllers: [v2UserController],
  providers: [v2UserService],
})
export class v2UserModule {}
