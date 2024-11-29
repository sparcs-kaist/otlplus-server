import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { session_userprofile } from '@prisma/client';
import { ITimetable } from 'src/common/interfaces';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { toJsonTimetable } from '../../common/interfaces/serializer/timetable.serializer';
import { LecturesService } from '../lectures/lectures.service';
import { TimetablesService } from './timetables.service';

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
  ) {
    const timeTableList = await this.timetablesService.getTimetables(
      query,
      user,
    );
    return timeTableList.map((timeTable) => toJsonTimetable(timeTable));
  }

  @Get('/:timetableId')
  async getTimeTable(
    @Param('userId') userId: number,
    @Param('timetableId') timetableId: number,
    @GetUser() user: session_userprofile,
  ) {
    const timeTable = await this.timetablesService.getTimetable(timetableId);
    return toJsonTimetable(timeTable);
  }

  @Delete('/:timetableId')
  async deleteTimetable(
    @Param('userId') userId: number,
    @Param('timetableId') timetableId: number,
    @GetUser() user: session_userprofile,
  ) {
    await this.timetablesService.deleteTimetable(user, timetableId);
    return null;
  }

  @Post()
  async createTimetable(
    @Body() timeTableBody: ITimetable.CreateDto,
    @GetUser() user: session_userprofile,
  ) {
    const timeTable = await this.timetablesService.createTimetable(
      timeTableBody,
      user,
    );
    return toJsonTimetable(timeTable);
  }

  @Post('/:timetableId/add-lecture')
  async addLectureToTimetable(
    @Param('timetableId') timetableId: number,
    @Body() body: ITimetable.AddLectureDto,
  ) {
    const timeTable = await this.timetablesService.addLectureToTimetable(
      timetableId,
      body,
    );
    return toJsonTimetable(timeTable);
  }

  @Post('/:timetableId/remove-lecture')
  async removeLectureFromTimetable(
    @Param('timetableId') timetableId: number,
    @Body() body: ITimetable.AddLectureDto,
  ) {
    const timeTable = await this.timetablesService.removeLectureFromTimetable(
      timetableId,
      body,
    );
    return toJsonTimetable(timeTable);
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
  ) {
    const timeTable = await this.timetablesService.reorderTimetable(
      user,
      timetableId,
      body,
    );
    return toJsonTimetable(timeTable);
  }
}
