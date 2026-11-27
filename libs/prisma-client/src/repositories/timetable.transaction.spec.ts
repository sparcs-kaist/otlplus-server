import { Module } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { ClsPluginTransactional, TransactionHost } from '@nestjs-cls/transactional'
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma'
import { session_userprofile } from '@prisma/client'
import crypto from 'crypto'
import { ClsModule } from 'nestjs-cls'

import { PrismaService } from '../prisma.service'
import { CustomblockRepository } from './customblock.repository'
import { FriendRepository } from './friend.repository'
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
  let friend: session_userprofile
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
      providers: [TimetableRepository, CustomblockRepository, FriendRepository],
    }).compile()
    await module.init()
    host = module.get(TransactionHost)
    timetables = module.get(TimetableRepository)
    customblocks = module.get(CustomblockRepository)
    user = await prisma.session_userprofile.create({
      data: { student_id: 'tx-test', sid: 'tx-test', date_joined: new Date(), first_name: 'Transaction', last_name: 'Test' },
    })
    friend = await prisma.session_userprofile.create({
      data: { student_id: 'code-test', sid: 'code-test', date_joined: new Date(), first_name: 'Friend', last_name: 'Test' },
    })
  })

  afterAll(async () => {
    if (friend) await prisma.session_userprofile.delete({ where: { id: friend.id } })
    if (user) {
      const tables = await timetables.getTimetableBasics(user)
      for (const table of tables) await timetables.deleteById(table.id, user.id)
      await prisma.block_custom_blocks.deleteMany({ where: { id: { in: createdBlockIds } } })
      await prisma.session_userprofile.delete({ where: { id: user.id } })
    }
    await module?.close()
  })

  describe('friend code history', () => {
    let friends: FriendRepository

    beforeEach(async () => {
      friends = module.get(FriendRepository)
      await prisma.session_userprofile_friend_codes.deleteMany({ where: { userprofile_id: { in: [user.id, friend.id] } } })
    })
    afterEach(() => jest.restoreAllMocks())

    it('retains changed codes and existing friendships while only accepting the new code', async () => {
      await friends.createPair(user.id, friend.id)
      const relations = await friends.getFriends(user.id)
      const oldCode = await friends.getOrCreateCode(user.id)
      const newCode = await friends.regenerateCode(user.id)
      expect(newCode).not.toBe(oldCode)
      expect(await friends.getUserIdByCode(oldCode)).toBeNull()
      expect(await friends.getUserIdByCode(newCode)).toBe(user.id)
      expect(await friends.getFriends(user.id)).toEqual(relations)
      expect(await prisma.session_userprofile_friend_codes.findUnique({ where: { code: oldCode } }))
        .toMatchObject({ userprofile_id: user.id, is_changed: true })
      expect(await friends.getOrCreateCode(user.id)).toBe(newCode)
    })

    it('never reallocates a changed code to another user', async () => {
      await prisma.session_userprofile_friend_codes.create({ data: { userprofile_id: user.id, code: 'AAAAAA', is_changed: true } })
      let index = 0
      jest.spyOn(crypto, 'randomInt').mockImplementation((() => Math.floor(index++ / 6)) as typeof crypto.randomInt)
      expect(await friends.getOrCreateCode(friend.id)).toBe('CCCCCC')
      expect(await friends.getUserIdByCode('AAAAAA')).toBeNull()
    })

    it('rolls back invalidation when every generated code collides', async () => {
      await prisma.session_userprofile_friend_codes.create({ data: { userprofile_id: user.id, code: 'AAAAAA' } })
      jest.spyOn(crypto, 'randomInt').mockImplementation((() => 0) as typeof crypto.randomInt)
      await expect(friends.regenerateCode(user.id)).rejects.toThrow('Could not allocate a unique friend code')
      expect(await friends.getUserIdByCode('AAAAAA')).toBe(user.id)
      expect(await prisma.session_userprofile_friend_codes.count({ where: { userprofile_id: user.id } })).toBe(1)
    })

    it('serializes concurrent first issuance and regeneration to keep one active code', async () => {
      const first = await Promise.all(Array.from({ length: 3 }, () => friends.getOrCreateCode(user.id)))
      expect(new Set(first).size).toBe(1)
      const issued = await Promise.all([
        friends.regenerateCode(user.id), friends.regenerateCode(user.id), friends.getOrCreateCode(user.id),
      ])
      const rows = await prisma.session_userprofile_friend_codes.findMany({ where: { userprofile_id: user.id } })
      expect(rows).toHaveLength(3)
      const active = rows.filter((row) => !row.is_changed)
      expect(active).toHaveLength(1)
      expect(issued).toContain(active[0].code)
      expect(await friends.getUserIdByCode(first[0])).toBeNull()
      for (const row of rows.filter((code) => code.is_changed)) {
        expect(await friends.getUserIdByCode(row.code)).toBeNull()
      }
    })
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

  it('joins the caller transaction when deleting and moves home selection only on committed deletion', async () => {
    const table = await timetables.createTimetable(user, 2026, 3, 1, [])
    const block = await customblocks.createCustomblock(blockData)
    createdBlockIds.push(block.id)
    await customblocks.addCustomblockToTimetable(table.id, block.id)
    await timetables.setHomeTimetable(user.id, 2026, 3, table.id)
    await expect(host.withTransaction(async () => {
      await timetables.deleteById(table.id, user.id)
      throw new Error('later failure')
    })).rejects.toThrow('later failure')
    expect((await timetables.getHomeTimetable(user.id, 2026, 3))?.id).toBe(table.id)
    expect(await customblocks.getCustomblocksList(table.id)).toEqual([block])
    await timetables.deleteById(table.id, user.id)
    expect(await prisma.timetable_timetable.findUnique({ where: { id: table.id } })).toBeNull()
    const remaining = (await timetables.getTimetableBasics(user, 2026, 3, { orderBy: { arrange_order: 'asc' } }))[0]
    expect((await timetables.getHomeTimetable(user.id, 2026, 3))?.id).toBe(remaining.id)
    expect(await customblocks.getCustomblocksList(table.id)).toEqual([])
  })

  it('rolls back cleared main and shared flags if selecting a missing timetable fails', async () => {
    const table = await timetables.createTimetable(user, 2029, 1, 0, [])
    await timetables.setSharedTimetableSelection(user.id, 2029, 1, table.id)
    await expect(timetables.setHomeTimetable(user.id, 2029, 1, -1)).rejects.toThrow()
    await expect(timetables.setSharedTimetableSelection(user.id, 2029, 1, -1)).rejects.toThrow()
    expect(await prisma.timetable_timetable.findUnique({ where: { id: table.id } }))
      .toMatchObject({ is_main: true, is_shared: true })
    await timetables.setSharedTimetableSelection(user.id, 2029, 1, null)
    expect(await prisma.timetable_timetable.findUnique({ where: { id: table.id } }))
      .toMatchObject({ is_main: true, is_shared: false })
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
