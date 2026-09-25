import { Module } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { ClsPluginTransactional, TransactionHost } from '@nestjs-cls/transactional'
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma'
import { session_userprofile } from '@prisma/client'
import { ClsModule } from 'nestjs-cls'

import { PrismaService } from '../prisma.service'
import { CustomblockRepository } from './customblock.repository'
import { TimetableRepository } from './timetable.repository'

// Run against an isolated local database after applying schema.prisma.
const databaseUrl = process.env.TIMETABLE_TEST_DATABASE_URL
const integration = databaseUrl ? describe : describe.skip

integration('Timetable transaction storage (local MySQL)', () => {
  let module: TestingModule
  let prisma: PrismaService
  let host: TransactionHost<TransactionalAdapterPrisma>
  let timetables: TimetableRepository
  let customblocks: CustomblockRepository
  let user: session_userprofile
  const createdBlockIds: number[] = []
  const blockData = { block_name: 'transaction test', place: '', day: 0, begin: 600, end: 660 }

  beforeAll(async () => {
    const url = new URL(databaseUrl!)
    if (!['localhost', '127.0.0.1', '[::1]'].includes(url.hostname) || !url.pathname.startsWith('/otl_timetable_test')) {
      throw new Error('Timetable integration tests require an isolated local otl_timetable_test database')
    }
    prisma = new PrismaService({
      host: url.hostname,
      port: Number(url.port || 3306),
      user: decodeURIComponent(url.username),
      password: decodeURIComponent(url.password),
      database: url.pathname.slice(1),
      connectionLimit: 5,
    })
    @Module({ providers: [{ provide: PrismaService, useValue: prisma }], exports: [PrismaService] })
    class TestDatabaseModule {}

    module = await Test.createTestingModule({
      imports: [
        TestDatabaseModule,
        ClsModule.forRoot({
          global: true,
          plugins: [new ClsPluginTransactional({
            imports: [TestDatabaseModule],
            adapter: new TransactionalAdapterPrisma({ prismaInjectionToken: PrismaService }),
          })],
        }),
      ],
      providers: [TimetableRepository, CustomblockRepository],
    }).compile()
    await module.init()
    host = module.get(TransactionHost)
    timetables = module.get(TimetableRepository)
    customblocks = module.get(CustomblockRepository)
    user = await prisma.session_userprofile.create({
      data: { student_id: 'tx-test', sid: 'tx-test', date_joined: new Date(), first_name: 'Transaction', last_name: 'Test' },
    })
  })

  afterAll(async () => {
    if (user) {
      const tables = await timetables.getTimetableBasics(user)
      for (const table of tables) await timetables.deleteById(table.id)
      await prisma.block_custom_blocks.deleteMany({ where: { id: { in: createdBlockIds } } })
      await prisma.session_userprofile.delete({ where: { id: user.id } })
    }
    await module?.close()
  })

  it('rolls back changes in both repositories when a later write fails', async () => {
    const table = await timetables.createTimetable(user, 2026, 3, 0, [])
    let blockId: number | undefined
    await expect(host.withTransaction(async () => {
      await timetables.lockTimetable(table.id)
      const block = await customblocks.createCustomblock(blockData)
      blockId = block.id
      createdBlockIds.push(block.id)
      await customblocks.addCustomblockToTimetable(table.id, block.id)
      // A missing lecture forces an actual DB foreign-key failure after the first item is stored.
      await timetables.addLectureToTimetable(table.id, -1)
    })).rejects.toThrow()
    expect(blockId).toBeDefined()
    expect(await prisma.block_custom_blocks.findUnique({ where: { id: blockId } })).toBeNull()
    expect(await customblocks.getCustomblocksList(table.id)).toEqual([])
    expect(await timetables.getTimeTableLectures(table.id)).toEqual([])
  })

  it('joins the caller transaction when deleting and clears home selection only on committed deletion', async () => {
    const table = await timetables.createTimetable(user, 2026, 3, 1, [])
    const block = await customblocks.createCustomblock(blockData)
    createdBlockIds.push(block.id)
    await customblocks.addCustomblockToTimetable(table.id, block.id)
    await timetables.setHomeTimetable(user.id, 2026, 3, table.id)
    await expect(host.withTransaction(async () => {
      await timetables.deleteById(table.id)
      throw new Error('later failure')
    })).rejects.toThrow('later failure')
    expect((await timetables.getHomeTimetable(user.id, 2026, 3))?.timetable_id).toBe(table.id)
    expect(await customblocks.getCustomblocksList(table.id)).toEqual([block])
    await timetables.deleteById(table.id)
    expect(await prisma.timetable_timetable.findUnique({ where: { id: table.id } })).toBeNull()
    expect((await timetables.getHomeTimetable(user.id, 2026, 3))?.timetable_id).toBeNull()
    expect(await customblocks.getCustomblocksList(table.id)).toEqual([])
  })

  it('holds the row lock until commit so a concurrent writer reads the committed items', async () => {
    const table = await timetables.createTimetable(user, 2026, 3, 2, [])
    let releaseFirst!: () => void
    let firstLocked!: () => void
    let secondStarted!: () => void
    const release = new Promise<void>((resolve) => { releaseFirst = resolve })
    const locked = new Promise<void>((resolve) => { firstLocked = resolve })
    const started = new Promise<void>((resolve) => { secondStarted = resolve })
    let secondAcquired = false
    const first = host.withTransaction(async () => {
      await timetables.lockTimetable(table.id)
      firstLocked()
      await release
      const block = await customblocks.createCustomblock(blockData)
      createdBlockIds.push(block.id)
      await customblocks.addCustomblockToTimetable(table.id, block.id)
      return block
    })
    await locked
    const second = host.withTransaction(async () => {
      secondStarted()
      await timetables.lockTimetable(table.id)
      secondAcquired = true
      return customblocks.getCustomblocksList(table.id)
    })
    try {
      await started
      await new Promise((resolve) => setTimeout(resolve, 100))
      expect(secondAcquired).toBe(false)
    } finally {
      releaseFirst()
    }
    const [block, observed] = await Promise.all([first, second])
    expect(observed).toEqual([block])
  })
})
