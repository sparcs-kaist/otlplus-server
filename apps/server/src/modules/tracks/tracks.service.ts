import { Injectable } from '@nestjs/common'
import { IPlanner } from '@otl/server-nest/common/interfaces'
import {
  toJsonAdditionalTrack,
  toJsonGeneralTrack,
  toJsonMajorTrack,
} from '@otl/server-nest/common/serializer/track.serializer'

import { TracksRepository } from '@otl/prisma-client/repositories'

@Injectable()
export class TracksService {
  constructor(private readonly trackRepository: TracksRepository) {}

  public async getAllTrack(): Promise<{
    general: IPlanner.ITrack.General[]
    major: IPlanner.ITrack.Major[]
    additional: IPlanner.ITrack.Additional[]
  }> {
    const { generalTracks, majorTracks, addtionalTracks } = await this.trackRepository.getAllTracks()
    return {
      general: generalTracks.map(toJsonGeneralTrack),
      major: majorTracks.map(toJsonMajorTrack),
      additional: addtionalTracks.map(toJsonAdditionalTrack),
    }
  }
}
