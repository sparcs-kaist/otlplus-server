import { Controller, Get } from '@nestjs/common';
import { TracksService } from './tracks.service';

@Controller('/api/tracks')
export class TracksController {
  constructor(private readonly tracksService: TracksService) {}

  @Get()
  async getTracks() {
    return await this.tracksService.getAllTrack();
  }
}
