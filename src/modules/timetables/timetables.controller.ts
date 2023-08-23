import { Body, Controller, Get, Param, Post, Query } from "@nestjs/common";
import { TimetablesService } from "./timetables.service";
import { GetUser } from "../../common/decorators/get-user.decorator";
import { session_userprofile } from "@prisma/client";
import {
  AddLectureDto,
  TimetableCreateDto,
  TimetableQueryDto
} from "../../common/interfaces/dto/timetable/timetable.request.dto";
import { toJsonTimetable } from "../../common/interfaces/serializer/timetable.serializer";
import { LecturesService } from "../lectures/lectures.service";

@Controller("/api/users/:userId/timetables")
export class TimetablesController {

  constructor(
    private readonly timetablesService: TimetablesService,
    private readonly lectureService: LecturesService
  ) {
  }

  @Get()
  async getTimetables(
    @Param("userId") userId: string,
    @Query() query: TimetableQueryDto,
    @GetUser() user: session_userprofile
  ) {

    const timeTableList = await this.timetablesService.getTimetables(query, user);
    return timeTableList.map((timeTable) => toJsonTimetable(timeTable));
  }

  @Post()
  async createTimetable(@Body() timeTableBody: TimetableCreateDto, @GetUser() user: session_userprofile) {
    const timeTable = await this.timetablesService.createTimetable(timeTableBody, user);
    return toJsonTimetable(timeTable);
  }

  @Post('/:timetableId/add-lecture')
  async addLectureToTimetable(
    @Param('timetableId') timetableId: number,
    @Body() body: AddLectureDto,
    ){
    const timeTable = await this.timetablesService.addLectureToTimetable(timetableId, body);
    return toJsonTimetable(timeTable);
  }

}
