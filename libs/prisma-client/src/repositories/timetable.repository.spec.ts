import { Prisma } from '@prisma/client'

import { PrismaService } from '../prisma.service'
import { TimetableRepository } from './timetable.repository'

it.each([false, true])('deletes timetable relations inside a transaction (failure: %s)', async (fail) => {
  const calls: string[] = []
  const error = new Error('Custom block removal failed')
  const tx = {
    timetable_timetable_lectures: {
      deleteMany: jest.fn(async () => {
        calls.push('lectures')
      }),
    },
    timetable_timetable_customblocks: {
      deleteMany: jest.fn(async () => {
        calls.push('customblocks')
        if (fail) throw error
      }),
    },
    timetable_timetable: {
      delete: jest.fn(async () => {
        calls.push('timetable')
        return { id: 42 }
      }),
    },
  }
  const prisma = {
    $transaction: jest.fn((work: (client: Prisma.TransactionClient) => Promise<unknown>) =>
      work(tx as unknown as Prisma.TransactionClient),
    ),
  }
  const repository = new TimetableRepository(prisma as unknown as PrismaService)
  const result = repository.deleteById(42)

  if (fail) {
    await expect(result).rejects.toBe(error)
    expect(calls).toEqual(['lectures', 'customblocks'])
    expect(tx.timetable_timetable.delete).not.toHaveBeenCalled()
  } else {
    await expect(result).resolves.toEqual({ id: 42 })
    expect(calls).toEqual(['lectures', 'customblocks', 'timetable'])
    expect(tx.timetable_timetable.delete).toHaveBeenCalledWith({ where: { id: 42 } })
  }
  expect(prisma.$transaction).toHaveBeenCalledTimes(1)
  expect(tx.timetable_timetable_lectures.deleteMany).toHaveBeenCalledWith({ where: { timetable_id: 42 } })
  expect(tx.timetable_timetable_customblocks.deleteMany).toHaveBeenCalledWith({ where: { timetable_id: 42 } })
})
