import { Module } from '@nestjs/common'

import { PrismaModule } from '@otl/prisma-client/prisma.module'

import { PlannersController } from './planners.controller'
import { PlannersService } from './planners.service'

@Module({
  imports: [PrismaModule],
  controllers: [PlannersController],
  providers: [PlannersService],
})
export class PlannersModule {}
