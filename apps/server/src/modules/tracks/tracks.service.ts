import { Injectable } from '@nestjs/common';
import { TracksRepository } from '@otl/prisma-client/repositories';
import { IPlanner } from '../../common/interfaces';
import { toJsonAdditionalTrack, toJsonGeneralTrack, toJsonMajorTrack } from '../../common/serializer/track.serializer';

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
