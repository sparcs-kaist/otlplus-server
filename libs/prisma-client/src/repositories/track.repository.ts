import { Injectable } from '@nestjs/common'

import { PrismaReadService } from '@otl/prisma-client/prisma.read.service'
import { PrismaService } from '@otl/prisma-client/prisma.service'

import { ETrack } from '../entities/ETrack'

@Injectable()
export class TracksRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly prismaRead: PrismaReadService,
  ) {}

  public async getAllTracks(): Promise<{
    generalTracks: ETrack.General[]
    majorTracks: ETrack.Major[]
    addtionalTracks: ETrack.Additional[]
  }> {
    const generalTracks = await this.prismaRead.graduation_generaltrack.findMany({
      orderBy: [{ is_foreign: 'asc' }, { start_year: 'asc' }, { end_year: 'asc' }],
    })
    const majorTracks = await this.prismaRead.graduation_majortrack.findMany({
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
    })
    const addtionalTracks = await this.prismaRead.graduation_additionaltrack.findMany({
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
    })
    const sortedAddtionalTracks = addtionalTracks.sort((a, b) => a.type.length - b.type.length)

    return {
      generalTracks,
      majorTracks,
      addtionalTracks: sortedAddtionalTracks,
    }
  }
}
