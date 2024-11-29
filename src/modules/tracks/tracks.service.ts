import { Injectable } from '@nestjs/common';
import {
  toJsonAdditionalTrack,
  toJsonGeneralTrack,
  toJsonMajorTrack,
} from 'src/common/interfaces/serializer/track.serializer';
import { TracksRepository } from 'src/prisma/repositories/track.repository';

@Injectable()
export class TracksService {
  constructor(private readonly TracksRepository: TracksRepository) {}

  public async getAllTrack() {
    const { generalTracks, majorTracks, addtionalTracks } =
      await this.TracksRepository.getAllTracks();
    return {
      general: generalTracks.map(toJsonGeneralTrack),
      major: majorTracks.map(toJsonMajorTrack),
      additional: addtionalTracks.map(toJsonAdditionalTrack),
    };
  }
}
