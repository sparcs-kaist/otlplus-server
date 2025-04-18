import { Module } from '@nestjs/common'

import { PrismaModule } from '@otl/prisma-client/prisma.module'

import { SemestersController } from './semesters.controller'
import { SemestersService } from './semesters.service'

@Module({
  imports: [PrismaModule],
  controllers: [SemestersController],
  providers: [SemestersService],
  exports: [SemestersService],
})
export class SemestersModule {}
