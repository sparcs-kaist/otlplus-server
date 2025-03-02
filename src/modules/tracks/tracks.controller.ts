import { Controller, Get } from '@nestjs/common';
import { TracksService } from './tracks.service';
import { Public } from '@src/common/decorators/skip-auth.decorator';

@Controller('/api/tracks')
export class TracksController {
  constructor(private readonly tracksService: TracksService) {}

  @Get()
  @Public()
  async getTracks() {
    return await this.tracksService.getAllTrack();
  }
}
