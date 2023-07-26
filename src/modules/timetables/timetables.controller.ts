import { Controller, Get, Param, Query } from "@nestjs/common";
import { TimetablesService } from "./timetables.service";
import { GetUser } from "../../common/decorators/get-user.decorator";
import { session_userprofile } from "@prisma/client";
import { TimeTableQueryDto } from "../../common/interfaces/dto/timetable/timetable.request.dto";

@Controller('users/:userId/timetables')
export class TimetablesController {

  constructor(
    private readonly timetablesService: TimetablesService,
  ) {
  }

  @Get()
  async getTimetables(
    @Param('userId') userId: string,
    @Query() query: TimeTableQueryDto,
    @GetUser() user: session_userprofile
  ) {

    return await this.timetablesService.getTimetables( query, user);
  }
}
