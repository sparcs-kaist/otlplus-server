import { Injectable } from '@nestjs/common';
import { ETrack } from 'src/common/entities/ETrack';
import { PrismaService } from '../prisma.service';

@Injectable()
export class TracksRepository {
  constructor(private readonly prisma: PrismaService) {}

  public async getAllTracks(): Promise<{
    generalTracks: ETrack.General[];
    majorTracks: ETrack.Major[];
    addtionalTracks: ETrack.Additional[];
  }> {
    const generalTracks = await this.prisma.graduation_generaltrack.findMany({
      orderBy: [
        { is_foreign: 'asc' },
        { start_year: 'asc' },
        { end_year: 'asc' },
      ],
    });
    const majorTracks = await this.prisma.graduation_majortrack.findMany({
      include: {
        subject_department: true,
      },
      orderBy: [
        {
          subject_department: {
            code: 'asc',
          },
        },
        { start_year: 'asc' },
        { end_year: 'asc' },
      ],
    });
    const addtionalTracks =
      await this.prisma.graduation_additionaltrack.findMany({
        include: {
          subject_department: true,
        },
        orderBy: [
          {
            subject_department: {
              code: 'asc',
            },
          },
          { start_year: 'asc' },
          { end_year: 'asc' },
        ],
      });
    const sortedAddtionalTracks = addtionalTracks.sort((a, b) => {
      return a.type.length - b.type.length;
    });

    return {
      generalTracks,
      majorTracks,
      addtionalTracks: sortedAddtionalTracks,
    };
  }
}
