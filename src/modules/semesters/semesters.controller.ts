import { Controller, Get, Query } from "@nestjs/common";
import { SemestersService } from "./semesters.service";
import { GetUser } from "../../common/decorators/get-user.decorator";
import { SemesterQueryDto } from "../../common/interfaces/dto/semester/semester.request.dto";
import { toJsonSemester } from "../../common/interfaces/serializer/semester.serializer";

@Controller('api/semesters')
export class SemestersController {
  constructor(
    private readonly semestersService: SemestersService,
  ) {
  }

  @Get()
  async getSemesters(
    @Query() query: SemesterQueryDto,
    @GetUser() user,
  ) {
    const semesters = await this.semestersService.getSemesters(query);
    return semesters.map((semester) => toJsonSemester(semester));
  }
}
