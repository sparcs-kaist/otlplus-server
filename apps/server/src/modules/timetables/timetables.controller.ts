import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UnauthorizedException,
} from '@nestjs/common'
import { GetUser } from '@otl/server-nest/common/decorators/get-user.decorator'
import { ILecture, ITimetable } from '@otl/server-nest/common/interfaces'
import { v2toJsonLectureDetail } from '@otl/server-nest/common/serializer/lecture.serializer'
import {
  toJsonTimetable,
  v2DetailedtoJsonTimetable,
  v2toJsonTimetable,
} from '@otl/server-nest/common/serializer/timetable.serializer'
import { session_userprofile } from '@prisma/client'

import { LecturesService } from '../lectures/lectures.service'
import { TimetablesService } from './timetables.service'

@Controller('/api/users/:userId/timetables')
export class TimetablesController {
  constructor(
    private readonly timetablesService: TimetablesService,
    private readonly lectureService: LecturesService,
  ) {}

  @Get()
  async getTimetables(
    @Param('userId') userId: number,
    @Query() query: ITimetable.QueryDto,
    @GetUser() user: session_userprofile,
  ): Promise<ITimetable.Response[]> {
    const timeTableList = await this.timetablesService.getTimetables(query, user)
    return timeTableList.map((timeTable) => toJsonTimetable(timeTable))
  }

  @Get('/:timetableId')
  async getTimeTable(
    @Param('userId') userId: number,
    @Param('timetableId') timetableId: number,
    @GetUser() _user: session_userprofile,
  ): Promise<ITimetable.Response> {
    const timeTable = await this.timetablesService.getTimetable(timetableId)
    return toJsonTimetable(timeTable)
  }

  @Delete('/:timetableId')
  async deleteTimetable(
    @Param('userId') userId: number,
    @Param('timetableId') timetableId: number,
    @GetUser() user: session_userprofile,
  ): Promise<ITimetable.Response[]> {
    const timetables = await this.timetablesService.deleteTimetable(user, timetableId)
    return timetables.map((timeTable) => toJsonTimetable(timeTable))
  }

  @Post()
  async createTimetable(
    @Body() timeTableBody: ITimetable.CreateDto,
    @GetUser() user: session_userprofile,
  ): Promise<ITimetable.Response> {
    const timeTable = await this.timetablesService.createTimetable(timeTableBody, user)
    return toJsonTimetable(timeTable)
  }

  @Post('/:timetableId/add-lecture')
  async addLectureToTimetable(
    @Param('timetableId') timetableId: number,
    @Body() body: ITimetable.AddLectureDto,
  ): Promise<ITimetable.Response> {
    const timeTable = await this.timetablesService.addLectureToTimetable(timetableId, body)
    return toJsonTimetable(timeTable)
  }

  @Post('/:timetableId/remove-lecture')
  async removeLectureFromTimetable(
    @Param('timetableId') timetableId: number,
    @Body() body: ITimetable.AddLectureDto,
  ): Promise<ITimetable.Response> {
    const timeTable = await this.timetablesService.removeLectureFromTimetable(timetableId, body)
    return toJsonTimetable(timeTable)
  }

  @Post('/:timetableId/reorder')
  async reorderTimetable(
    /**
     * @todo use user by auth instead of userId by endpoint param
     * userId should be removed from endpoint in the future
     * since each user should only control their own timetable
     */
    @Param('userId') userId: number,
    @Param('timetableId') timetableId: number,
    @Body() body: ITimetable.ReorderTimetableDto,
    @GetUser() user: session_userprofile,
  ): Promise<ITimetable.Response> {
    const timeTable = await this.timetablesService.reorderTimetable(user, timetableId, body)
    return toJsonTimetable(timeTable)
  }
}

@Controller('/api/v2/timetables')
export class v2TimetablesController {
  constructor(
    private readonly timetablesService: TimetablesService,
    private readonly lectureService: LecturesService,
  ) {}

  @Get()
  async getTimetables(
    @Query() query: ITimetable.QueryDto,
    @GetUser() user: session_userprofile,
  ): Promise<ITimetable.v2Response[]> {
    const timeTableList = await this.timetablesService.getTimetables(query, user)
    return timeTableList.map((timeTable) => v2toJsonTimetable(timeTable))
  }

  @Get('/:timetableId')
  async getTimeTable(@Param('timetableId') timetableId: number): Promise<ITimetable.v2DetailedResponse> {
    const timeTable = await this.timetablesService.getTimetable(timetableId)
    return v2DetailedtoJsonTimetable(timeTable)
  }

  @Post()
  async createTimetable(
    @Body() timeTableBody: ITimetable.v2CreateDto,
    @GetUser() user: session_userprofile,
  ): Promise<ITimetable.v2DetailedResponse> {
    const timeTable = await this.timetablesService.createTimetable(timeTableBody, user)
    return v2DetailedtoJsonTimetable(timeTable)
  }

  @Delete()
  async deleteTimetable(
    @Body() timetableBody: ITimetable.v2DeleteDto,
    @GetUser() user: session_userprofile,
  ): Promise<void> {
    const tt = await this.timetablesService.getTimetable(timetableBody.timeTableId)
    if (!tt) {
      throw new BadRequestException('timeTableId invalid')
    }
    if (tt.user_id !== user.id) {
      throw new UnauthorizedException()
    }
    await this.timetablesService.deleteTimetable(user, timetableBody.timeTableId)
  }

  @Patch()
  async updateTimetable(
    @Body() timetableBody: ITimetable.v2UpdateDto,
    @GetUser() user: session_userprofile,
  ): Promise<void> {
    const tt = await this.timetablesService.getTimetable(timetableBody.timeTableId)
    if (!tt || (!timetableBody.timeTableName && !timetableBody.timeTableOrder)) {
      throw new BadRequestException('timeTableId invalid or timeTableName and timeTableOrder all not given')
    }
    if (tt.user_id !== user.id) {
      throw new UnauthorizedException()
    }
    // tt.name = timetableBody.timeTableName ?? tt.name; 문제: timetable 데이터베이스에 name 속성이 없음
    tt.arrange_order = timetableBody.timeTableOrder ?? tt.arrange_order
    await this.timetablesService.v2UpdateTimetable(timetableBody.timeTableId, {
      timeTableName: null,
      timeTableOrder: tt.arrange_order,
    })
  }

  @Patch('/:timetableId')
  async modifyLectureToTimetable(
    @Param('timetableId') timetableId: number,
    @Body() timetableBody: ITimetable.v2ModifyLectureDto,
  ): Promise<ILecture.v2Detail> {
    const body = { lecture: timetableBody.lectureId }
    if (timetableBody.mode === 'add') {
      await this.timetablesService.addLectureToTimetable(timetableId, body)
    }
    else if (timetableBody.mode === 'delete') {
      await this.timetablesService.removeLectureFromTimetable(timetableId, body)
    }
    else {
      throw new BadRequestException('mode should be add or delete')
    }
    const lecture = await this.lectureService.getELectureDetailsById(timetableBody.lectureId)
    return v2toJsonLectureDetail(lecture)
  }
}
