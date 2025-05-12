import { Module } from '@nestjs/common'

import { PrismaModule } from '@otl/prisma-client/prisma.module'

import { PersonalsController } from './personals.controller'
import { PersonalsService } from './personals.service'

@Module({
  imports: [PrismaModule],
  controllers: [PersonalsController],
  providers: [PersonalsService],
})
export class PersonalsModule {}
