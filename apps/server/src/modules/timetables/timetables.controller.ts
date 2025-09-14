import {
  Body, Controller, Delete, Get, Param, Patch, Post, Query,
} from '@nestjs/common'
import { GetUser } from '@otl/server-nest/common/decorators/get-user.decorator'
import { ITimetable } from '@otl/server-nest/common/interfaces'
import { ICustomblock } from '@otl/server-nest/common/interfaces/ICustomblock'
import { toJsonTimetable } from '@otl/server-nest/common/serializer/timetable.serializer'
import { session_userprofile } from '@prisma/client'

import { LecturesService } from '../lectures/lectures.service'
import { TimetablesService } from './timetables.service'

// Format input to HH:mm (UTC). Accepts Date or string (HH:mm[:ss] or ISO).
function toHHmm(input: unknown): string {
  // If Date and valid
  if (input instanceof Date && !Number.isNaN(input.getTime())) {
    const hh = input.getUTCHours().toString().padStart(2, '0')
    const mm = input.getUTCMinutes().toString().padStart(2, '0')
    return `${hh}:${mm}`
  }
  // If string like HH:mm or HH:mm:ss
  if (typeof input === 'string') {
    const s = input.trim()
    const m = /^(\d{2}):(\d{2})(?::\d{2})?$/.exec(s)
    if (m) return `${m[1]}:${m[2]}`
    const d = new Date(s)
    if (!Number.isNaN(d.getTime())) return toHHmm(d)
  }
  // Fallback to 00:00 to avoid NaN:NaN in responses

  console.warn('[custom-blocks] toHHmm fallback for input:', input)
  return '00:00'
}

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
    // @Todo : Message(LECTURE_NUM_PEOPLE) 보내기
    return toJsonTimetable(timeTable)
  }

  @Post('/:timetableId/add-lecture')
  async addLectureToTimetable(
    @Param('timetableId') timetableId: number,
    @Body() body: ITimetable.AddLectureDto,
  ): Promise<ITimetable.Response> {
    const timeTable = await this.timetablesService.addLectureToTimetable(timetableId, body)
    // @Todo : Message(LECTURE_NUM_PEOPLE) 보내기
    return toJsonTimetable(timeTable)
  }

  @Post('/:timetableId/remove-lecture')
  async removeLectureFromTimetable(
    @Param('timetableId') timetableId: number,
    @Body() body: ITimetable.AddLectureDto,
  ): Promise<ITimetable.Response> {
    const timeTable = await this.timetablesService.removeLectureFromTimetable(timetableId, body)
    // @Todo : Message(LECTURE_NUM_PEOPLE) 보내기
    return toJsonTimetable(timeTable)
  }

  // custom block 관련 API
  // 특정 timetable의 custom block 목록 조회
  @Get('/:timetableId/custom-blocks')
  async getCustomblocks(
    @Param('timetableId') timetableId: number,
    @GetUser() user: session_userprofile,
  ): Promise<ICustomblock.ListResponse> {
    const items = await this.timetablesService.getCustomblockList(timetableId, user)
    const custom_blocks = items.map((it) => ({
      id: it.id,
      block_name: it.block_name,
      place: it.place,
      day: it.day,
      begin: toHHmm(it.begin),
      end: toHHmm(it.end),
    }))
    return { custom_blocks }
  }

  // 특정 timetable에 custom block 추가하기
  @Post('/:timetableId/custom-blocks')
  async addCustomblock(
    @Param('timetableId') timetableId: number,
    @Body() body: ICustomblock.CreateDto,
    @GetUser() user: session_userprofile,
  ): Promise<ICustomblock.CreateResponse> {
    const created = await this.timetablesService.addCustomblockToTimetable(timetableId, body, user)
    return { id: created.id }
  }

  // 특정 custom block 수정하기 (place, block_name)
  @Patch('/:timetableId/custom-blocks/:customblockId')
  async updateCustomblock(
    @Param('timetableId') timetableId: number,
    @Param('customblockId') customblockId: number,
    @Body() body: ICustomblock.UpdateDto,
    @GetUser() user: session_userprofile,
  ): Promise<ICustomblock.Basic> {
    return this.timetablesService.updateCustomblock(timetableId, customblockId, body, user)
  }

  // 특정 custom block 삭제하기
  @Delete('/:timetableId/custom-blocks/:customblockId')
  async removeCustomblock(
    @Param('timetableId') timetableId: number,
    @Param('customblockId') customblockId: number,
    @GetUser() user: session_userprofile,
  ): Promise<ICustomblock.DeleteDto> {
    await this.timetablesService.removeCustomblockFromTimetable(timetableId, customblockId, user)
    return { id: customblockId }
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
