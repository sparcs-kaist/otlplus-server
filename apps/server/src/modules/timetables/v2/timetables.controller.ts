import {
  Controller, Get, Param, Query,
} from '@nestjs/common'
import { GetUser } from '@otl/server-nest/common/decorators/get-user.decorator'
import { ITimetableV2 } from '@otl/server-nest/common/interfaces/v2'
import { toJsonTimetableV2 } from '@otl/server-nest/common/serializer/v2/timetable.serializer.v2'
import { session_userprofile } from '@prisma/client'

import { TimetablesServiceV2 } from './timetables.service'

@Controller('/api/users/:userId/timetables')
export class TimetablesControllerV2 {
  constructor(private readonly timetablesService: TimetablesServiceV2) {}

  @Get()
  async getTimetables(
    @Param('userId') userId: number,
    @Query() query: ITimetableV2.QueryDto,
    @GetUser() user: session_userprofile,
  ): Promise<ITimetableV2.Response[]> {
    const timeTableList = await this.timetablesService.getTimetables(query, user)
    return timeTableList.map((timeTable) => toJsonTimetableV2(timeTable))
  }
}
