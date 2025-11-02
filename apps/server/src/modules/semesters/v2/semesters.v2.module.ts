import { Module } from '@nestjs/common'

import { PrismaModule } from '@otl/prisma-client/prisma.module'

import { SemestersController } from './semesters.v2.controller'
import { SemestersService } from './semesters.v2.service'

@Module({
  imports: [PrismaModule],
  controllers: [SemestersController],
  providers: [SemestersService],
  exports: [SemestersService],
})
export class SemestersModule {}
