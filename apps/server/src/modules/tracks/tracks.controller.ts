import { Controller, Get } from '@nestjs/common'
import { Public } from '@otl/server-nest/common/decorators/skip-auth.decorator'
import { IPlanner } from '@otl/server-nest/common/interfaces'

import { TracksService } from './tracks.service'

@Controller('/api/tracks')
export class TracksController {
  constructor(private readonly tracksService: TracksService) {}

  @Get()
  @Public()
  async getTracks(): Promise<{
    general: IPlanner.ITrack.General[]
    major: IPlanner.ITrack.Major[]
    additional: IPlanner.ITrack.Additional[]
  }> {
    return await this.tracksService.getAllTrack()
  }
}
