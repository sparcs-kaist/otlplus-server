import { Injectable } from '@nestjs/common';

import { TracksRepository } from '@src/prisma/repositories/track.repository';
import { toJsonAdditionalTrack, toJsonGeneralTrack, toJsonMajorTrack } from '@src/common/serializer/track.serializer';
import { IPlanner } from '@otl/api-interface/src/interfaces';

@Injectable()
export class TracksService {
  constructor(private readonly TracksRepository: TracksRepository) {}

  public async getAllTrack(): Promise<{
    general: IPlanner.ITrack.General[];
    major: IPlanner.ITrack.Major[];
    additional: IPlanner.ITrack.Additional[];
  }> {
    const { generalTracks, majorTracks, addtionalTracks } = await this.TracksRepository.getAllTracks();
    return {
      general: generalTracks.map(toJsonGeneralTrack),
      major: majorTracks.map(toJsonMajorTrack),
      additional: addtionalTracks.map(toJsonAdditionalTrack),
    };
  }
}
