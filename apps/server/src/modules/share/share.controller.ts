import { Controller, Get, Query, Res } from '@nestjs/common';
import { session_userprofile } from '@prisma/client';
import { Response } from 'express';
import { IShare } from '@otl/server-nest/common/interfaces';
import { ShareService } from './share.service';
import { GetUser } from '@otl/server-nest/common/decorators/get-user.decorator';

@Controller('/api/share')
export class ShareController {
  constructor(private readonly shareService: ShareService) {}

  @Get('timetable/image')
  async getTimetableImage(
    @Query() query: IShare.TimetableImageQueryDto,
    @GetUser() user: session_userprofile,
    @Res() res: Response,
  ): Promise<void> {
    const imageBuffer = await this.shareService.createTimetableImage(query, user);
    res.setHeader('Content-Type', 'image/png');
    res.send(imageBuffer);
  }

  @Get('timetable/ical')
  async getTimetableIcal(
    @Query() query: IShare.TimetableIcalQueryDto,
    @GetUser() user: session_userprofile,
    @Res() res: Response,
  ): Promise<void> {
    const calendar = await this.shareService.createTimetableIcal(query, user);
    res.setHeader('Content-Type', 'text/calendar');
    res.send(calendar.toString());
  }
}
