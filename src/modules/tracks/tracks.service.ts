import { Injectable } from '@nestjs/common';
import {
  toJsonAdditionalTrack,
  toJsonGeneralTrack,
  toJsonMajorTrack,
} from 'src/common/interfaces/serializer/track.serializer';
import { TracksRepository } from 'src/prisma/repositories/track.repository';
import { IPlanner } from '../../common/interfaces/IPlanner';

@Injectable()
export class TracksService {
  constructor(private readonly TracksRepository: TracksRepository) {}

  public async getAllTrack(): Promise<{
    general: IPlanner.ITrack.General[];
    major: IPlanner.ITrack.Major[];
    additional: IPlanner.ITrack.Additional[];
  }> {
    const { generalTracks, majorTracks, addtionalTracks } =
      await this.TracksRepository.getAllTracks();
    return {
      general: generalTracks.map(toJsonGeneralTrack),
      major: majorTracks.map(toJsonMajorTrack),
      additional: addtionalTracks.map(toJsonAdditionalTrack),
    };
  }
}
