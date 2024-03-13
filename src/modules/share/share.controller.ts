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

@Controller('/api/share')
export class ShareController {
  constructor(
    private readonly shareService: ShareService,
    private readonly timetableRepository: TimetableRepository,
  ) {}

  @Get('timetable/image')
  async getTimetableImage(
    @Query('timetable') timetableId: number,
    @Query('year') year: number,
    @Query('semester') semester: number,
    @Query('language') language: string,
    @GetUser() user: session_userprofile,
    @Res() res: Response,
  ) {
    try {
      const imageBuffer = await this.shareService.createTimetableImage(
        timetableId,
        year,
        semester,
        language,
        user,
      );
      res.setHeader('Content-Type', 'image/png');
      // imageStream.pipe(res);
      res.send(imageBuffer);
    } catch (error) {
      throw new HttpException(
        'An error occurred while generating the timetable image',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
