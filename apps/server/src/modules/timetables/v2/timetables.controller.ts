import {
  Body, Controller, Param, ParseIntPipe, Patch, UnauthorizedException,
} from '@nestjs/common'
import { GetUser } from '@otl/server-nest/common/decorators/get-user.decorator'
import { ITimetableV2 } from '@otl/server-nest/common/interfaces/v2'
import { session_userprofile } from '@prisma/client'

import { TimetablesServiceV2 } from './timetables.service'

@Controller('api/users/:userId/timetables')
export class TimetablesControllerV2 {
  constructor(private readonly timetablesService: TimetablesServiceV2) {}

  @Patch()
  async updateTimetable(
    @Param('userId', ParseIntPipe) userId: number,
    @GetUser() user: session_userprofile,
    @Body() body: ITimetableV2.UpdateReqDto,
  ): Promise<ITimetableV2.UpdateResDto> {
    if (user.id !== userId) {
      throw new UnauthorizedException('Current user does not match path userId')
    }
    return await this.timetablesService.updateTimetable(user, body)
  }
}
