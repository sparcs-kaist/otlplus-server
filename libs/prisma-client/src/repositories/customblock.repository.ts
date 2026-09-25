import { Injectable } from '@nestjs/common'
import { TransactionHost } from '@nestjs-cls/transactional'
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma'

import { ECustomblock } from '../entities/ECustomblock'

@Injectable()
export class CustomblockRepository {
  constructor(private readonly txHost: TransactionHost<TransactionalAdapterPrisma>) {}

  // 커스텀 블록 생성
  async createCustomblock(data: ECustomblock.CreateInput): Promise<ECustomblock.Basic> {
    const times = data.times ?? [{ day: data.day!, begin: data.begin!, end: data.end! }]
    const block = await this.txHost.tx.block_custom_blocks.create({
      data: {
        block_name: data.block_name,
        place: data.place,
        ...times[0],
        times: { create: times },
      },
      include: { times: { orderBy: { id: 'asc' } } },
    })
    return ECustomblock.normalize(block)
  }

  // timetable에 custom block mapping 추가하기
  async addCustomblockToTimetable(timeTableId: number, customblockId: number) {
    return this.txHost.tx.timetable_timetable_customblocks.create({
      data: {
        timetable_id: timeTableId,
        custom_block_id: customblockId,
      },
    })
  }

  // 시간표에서 custom block 삭제하기
  async removeCustomblockFromTimetable(timeTableId: number, customblockId: number) {
    return this.txHost.tx.timetable_timetable_customblocks.delete({
      where: {
        timetable_id_custom_block_id: {
          timetable_id: timeTableId,
          custom_block_id: customblockId,
        },
      },
    })
  }

  // timetable에 있는 custom block 목록 가져오기
  async getCustomblocksList(timeTableId: number): Promise<ECustomblock.Basic[]> {
    const blocks = await this.txHost.tx.block_custom_blocks.findMany({
      where: {
        timetable_timetable_customblocks: {
          some: { timetable_id: timeTableId },
        },
      },
      select: {
        id: true,
        block_name: true,
        place: true,
        day: true,
        begin: true,
        end: true,
        times: { orderBy: { id: 'asc' } },
      },
    })
    return blocks.map(ECustomblock.normalize)
  }

  // 커스텀 블록 업데이트
  async updateCustomblock(customblockId: number, updateData: ECustomblock.UpdateInput): Promise<ECustomblock.Basic> {
    const { times, ...data } = updateData
    const block = await this.txHost.tx.block_custom_blocks.update({
      where: { id: customblockId },
      data: {
        ...data,
        ...(times ? { ...times[0], times: { deleteMany: {}, create: times } } : {}),
      },
      include: { times: { orderBy: { id: 'asc' } } },
    })
    return ECustomblock.normalize(block)
  }
}
