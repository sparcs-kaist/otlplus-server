import { Module } from '@nestjs/common'

import { PrismaModule } from '@otl/prisma-client'

import { MeetingController } from './meeting.controller'
import { MeetingService } from './meeting.service'

@Module({
  controllers: [MeetingController],
  providers: [MeetingService],
  imports: [PrismaModule],
})
export class MeetingModule {}
