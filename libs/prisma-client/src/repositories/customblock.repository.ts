import { Injectable } from '@nestjs/common'

import { PrismaReadService } from '@otl/prisma-client/prisma.read.service'
import { PrismaService } from '@otl/prisma-client/prisma.service'

import { ECustomblock } from '../entities/ECustomblock'

@Injectable()
export class CustomblockRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly prismaRead: PrismaReadService,
  ) {}

  // 커스텀 블록 생성
  async createCustomblock(data: ECustomblock.CreateInput): Promise<ECustomblock.Basic> {
    return this.prisma.block_custom_blocks.create({
      data,
    })
  }

  // timetable에 custom block mapping 추가하기
  async addCustomblockToTimetable(timeTableId: number, customblockId: number) {
    return this.prisma.timetable_timetable_customblocks.create({
      data: {
        timetable_id: timeTableId,
        custom_block_id: customblockId,
      },
    })
  }

  // 시간표에서 custom block 삭제하기
  async removeCustomblockFromTimetable(timeTableId: number, customblockId: number) {
    return this.prisma.timetable_timetable_customblocks.delete({
      where: {
        timetable_id_custom_block_id: {
          timetable_id: timeTableId,
          custom_block_id: customblockId,
        },
      },
    })
  }

  // timetable에 있는 custom block 목록 가져오기 (TIME을 문자열 HH:mm으로 직접 반환)
  async getCustomblocksList(timeTableId: number): Promise<
    Array<{
      id: number
      block_name: string
      place: string
      day: number
      begin: string
      end: string
    }>
  > {
    const rows = await this.prismaRead.$queryRaw<
      Array<{
        id: number
        block_name: string
        place: string
        day: number
        begin: string
        end: string
      }>
    >`\
      SELECT b.id,
             b.block_name,
             b.place,
             b.day,
             TIME_FORMAT(b.begin, '%H:%i') AS begin,
             TIME_FORMAT(b.end,   '%H:%i') AS end
        FROM block_custom_blocks AS b
        JOIN timetable_timetable_customblocks AS ttc
          ON ttc.custom_block_id = b.id
       WHERE ttc.timetable_id = ${timeTableId}
    `
    return rows
  }

  // block_name과 string만 업데이트
  async updateCustomblock(
    customblockId: number,
    updateData: { block_name?: string, place?: string },
  ): Promise<ECustomblock.Basic> {
    return this.prisma.block_custom_blocks.update({
      where: { id: customblockId },
      data: updateData,
    })
  }
}
