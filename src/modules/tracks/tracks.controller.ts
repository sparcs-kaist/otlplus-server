import { Controller, Get } from '@nestjs/common';
import { TracksService } from './tracks.service';
import { IPlanner } from '../../common/interfaces/IPlanner';
import { Public } from '@src/common/decorators/skip-auth.decorator';

@Controller('/api/tracks')
export class TracksController {
  constructor(private readonly tracksService: TracksService) {}

  @Get()
  @Public()
  async getTracks(): Promise<{
    general: IPlanner.ITrack.General[];
    major: IPlanner.ITrack.Major[];
    additional: IPlanner.ITrack.Additional[];
  }> {
    return await this.tracksService.getAllTrack();
  }
}
