import { TransactionHost } from '@nestjs-cls/transactional'
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma'
import { ETimetable } from '../entities/ETimetable'
import { TimetableRepository } from './timetable.repository'

it('reads friend timetable items only for the authorized owner and orders child times canonically', async () => {
  const findFirst = jest.fn().mockResolvedValue(null)
  const repository = new TimetableRepository({ tx: { timetable_timetable: { findFirst } } } as never)
  await expect(repository.getTimeTableWithItemsByIdAndUserId(99, 43)).resolves.toBeNull()
  expect(findFirst).toHaveBeenCalledWith({ where: { id: 99, user_id: 43 }, include: ETimetable.WithItems.include })
  expect(ETimetable.WithItems.include.timetable_timetable_customblocks.include.block_custom_blocks.include.times)
    .toEqual({ orderBy: { id: 'asc' } })
})

it.each([false, true])('deletes timetable relations inside a transaction (failure: %s)', async (fail) => {
  const calls: string[] = []
  const error = new Error('Custom block removal failed')
  const tx = {
    $queryRaw: jest.fn(async () => calls.push('lock')),
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
  const host = {
    tx,
    isTransactionActive: () => true,
    withTransaction: jest.fn((work: () => Promise<unknown>) => work()),
  }
  const repository = new TimetableRepository(host as unknown as TransactionHost<TransactionalAdapterPrisma>)
  const result = repository.deleteById(42)

  if (fail) {
    await expect(result).rejects.toBe(error)
    expect(calls).toEqual(['lock', 'lectures', 'customblocks'])
    expect(tx.timetable_timetable.delete).not.toHaveBeenCalled()
  } else {
    await expect(result).resolves.toEqual({ id: 42 })
    expect(calls).toEqual(['lock', 'lectures', 'customblocks', 'timetable'])
    expect(tx.timetable_timetable.delete).toHaveBeenCalledWith({ where: { id: 42 } })
  }
  expect(host.withTransaction).toHaveBeenCalledTimes(1)
  expect(tx.timetable_timetable_lectures.deleteMany).toHaveBeenCalledWith({ where: { timetable_id: 42 } })
  expect(tx.timetable_timetable_customblocks.deleteMany).toHaveBeenCalledWith({ where: { timetable_id: 42 } })
})


it('rejects a row lock outside a transaction', async () => {
  const host = { isTransactionActive: () => false }
  const repository = new TimetableRepository(host as unknown as TransactionHost<TransactionalAdapterPrisma>)
  await expect(repository.lockTimetable(42)).rejects.toThrow('Timetable locks require a transaction')
})
