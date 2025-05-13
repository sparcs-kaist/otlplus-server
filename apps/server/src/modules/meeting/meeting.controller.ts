import { Controller } from '@nestjs/common'

import { MeetingService } from './meeting.service'

@Controller('api/meeting')
export class MeetingController {
  constructor(private readonly meetingService: MeetingService) {}
}
