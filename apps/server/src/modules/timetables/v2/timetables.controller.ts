import {
  Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query,
} from '@nestjs/common'
import { GetLanguage, Language } from '@otl/server-nest/common/decorators/get-language.decorator'
import { GetUser } from '@otl/server-nest/common/decorators/get-user.decorator'
import { ITimetableV2 } from '@otl/server-nest/common/interfaces/v2'
import { session_userprofile } from '@prisma/client'

import { TimetablesServiceV2 } from './timetables.service'

@Controller('/api/v2/timetables')
export class TimetablesControllerV2 {
  constructor(private readonly timetablesService: TimetablesServiceV2) {}

  @Get()
  async getTimetables(@Query() query: ITimetableV2.GetTimetablesReqDto, @GetUser() user: session_userprofile) {
    return await this.timetablesService.getTimetables(user, query)
  }

  @Post()
  async createTimetable(
    @GetUser() user: session_userprofile,
    @Body() body: ITimetableV2.CreateReqDto,
    @GetLanguage() language: Language,
  ): Promise<ITimetableV2.CreateResDto> {
    return await this.timetablesService.createTimetable(user, body, language)
  }

  @Delete()
  async deleteTimetable(
    @GetUser() user: session_userprofile,
    @Body() body: ITimetableV2.DeleteReqDto,
  ): Promise<ITimetableV2.DeleteResDto> {
    return await this.timetablesService.deleteTimetable(user, body)
  }

  @Patch()
  async updateTimetable(
    @GetUser() user: session_userprofile,
    @Body() body: ITimetableV2.UpdateReqDto,
  ): Promise<ITimetableV2.UpdateResDto> {
    return await this.timetablesService.updateTimetable(user, body)
  }

  @Get('/my-timetable')
  async getMyTimetable(
    @Query() query: ITimetableV2.MyTimetableReqDto,
    @GetUser() user: session_userprofile,
    @GetLanguage() language: Language,
  ): Promise<ITimetableV2.MyTimetableResDto> {
    return await this.timetablesService.getMyTimetable(user, query, language)
  }

  @Get('/:timetableId')
  async getTimetable(
    @Param('timetableId', ParseIntPipe) timetableId: number,
    @GetUser() user: session_userprofile,
    @GetLanguage() language: Language,
  ): Promise<ITimetableV2.GetResDto> {
    return await this.timetablesService.getTimetable(timetableId, user, language)
  }

  @Patch('/:timetableId')
  async updateTimetableLecture(
    @GetUser() user: session_userprofile,
    @Param('timetableId', ParseIntPipe) timetableId: number,
    @Body() body: ITimetableV2.UpdateLectureReqDto,
  ): Promise<ITimetableV2.UpdateLectureResDto> {
    return await this.timetablesService.updateTimetableLecture(user, body, timetableId)
  }
}
