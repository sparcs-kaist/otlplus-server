import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Query,
  Res,
} from '@nestjs/common';
import { session_userprofile } from '@prisma/client';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { ShareService } from './share.service';
import { TimetableRepository } from 'src/prisma/repositories/timetable.repository';
import { Response } from 'express';
import { TimetableImageQueryDto } from 'src/common/interfaces/dto/share/share.request.dto';

@Controller('/api/share')
export class ShareController {
  constructor(
    private readonly shareService: ShareService,
    private readonly timetableRepository: TimetableRepository,
  ) {}

  @Get('timetable/image')
  async getTimetableImage(
    @Query() query: TimetableImageQueryDto,
    @GetUser() user: session_userprofile,
    @Res() res: Response,
  ) {
    const imageBuffer = await this.shareService.createTimetableImage(
      query,
      user,
    );
    res.setHeader('Content-Type', 'image/png');
    res.send(imageBuffer);
  }
}
