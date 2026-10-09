import { INestApplication, Module, ValidationPipe } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { ClsPluginTransactional } from '@nestjs-cls/transactional'
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma'
import { session_userprofile } from '@prisma/client'
import { ClsModule } from 'nestjs-cls'
import { existsSync, rmSync, writeFileSync } from 'fs'
import request from 'supertest'

import { PrismaService } from '@otl/prisma-client/prisma.service'
import { FriendsService } from '@otl/server-nest/modules/friends/friends.service'
import { SemesterRepository } from '@otl/prisma-client/repositories/semester.repository'
import { FriendRepository } from '@otl/prisma-client/repositories/friend.repository'
import { CourseRepository } from '@otl/prisma-client/repositories/course.repository'
import { CustomblockRepository } from '@otl/prisma-client/repositories/customblock.repository'
import { LectureRepository } from '@otl/prisma-client/repositories/lecture.repository'
import { TimetableRepository } from '@otl/prisma-client/repositories/timetable.repository'

import { TIMETABLE_MQ } from '../domain/out/TimetableMQ'
import { TimetablesControllerV2 } from './timetables.controller'
import { TimetablesServiceV2 } from './timetables.service'

const databaseUrl = process.env.TIMETABLE_TEST_DATABASE_URL
const integration = databaseUrl ? describe : describe.skip
const prefix = '/api/v2/timetables'
const term = { year: 2026, semester: 3 }
const blockTime = { day: 1, begin: 600, end: 660 }
const block = { block_name: 'HTTP fixture', place: 'Library', day: 1, begin: 600, end: 660 }

integration('Timetable HTTP compatibility (local MySQL)', () => {
  let app: INestApplication
  let prisma: PrismaService
  let timetables: TimetableRepository
  let lectures: LectureRepository
  let user: session_userprofile
  let otherUser: session_userprofile
  let lectureId: number
  let courseId: number
  let departmentId: number
  const customIds = new Set<number>()

  beforeAll(async () => {
    const url = new URL(databaseUrl!)
    if (!['localhost', '127.0.0.1', '[::1]'].includes(url.hostname) || !url.pathname.startsWith('/otl_timetable_test')) {
      throw new Error('HTTP integration tests require an isolated local otl_timetable_test database')
    }
    prisma = new PrismaService({
      host: url.hostname, port: Number(url.port || 3306),
      user: decodeURIComponent(url.username), password: decodeURIComponent(url.password),
      database: url.pathname.slice(1), connectionLimit: 5,
    })
    @Module({ providers: [{ provide: PrismaService, useValue: prisma }], exports: [PrismaService] })
    class TestDatabaseModule {}
    const module = await Test.createTestingModule({
      imports: [TestDatabaseModule, ClsModule.forRoot({
        global: true,
        middleware: { mount: true },
        plugins: [new ClsPluginTransactional({
          imports: [TestDatabaseModule],
          adapter: new TransactionalAdapterPrisma({ prismaInjectionToken: PrismaService }),
        })],
      })],
      controllers: [TimetablesControllerV2],
      providers: [TimetablesServiceV2, TimetableRepository, CustomblockRepository, LectureRepository, CourseRepository,
        { provide: TIMETABLE_MQ, useValue: { publishLectureNumUpdate: async () => true } }],
    }).compile()
    app = module.createNestApplication()
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }))
    if (process.env.TIMETABLE_HTTP_PORT) app.enableCors({ origin: true, credentials: true })
    app.use((req: { user: session_userprofile, headers: Record<string, string> }, _res: unknown, next: () => void) => {
      req.user = req.headers['x-test-other-user'] ? otherUser : user
      next()
    })
    await app.init()
    timetables = module.get(TimetableRepository)
    lectures = module.get(LectureRepository)
    const profile = { student_id: 'http-test', sid: 'http-test', date_joined: new Date(), first_name: 'HTTP', last_name: 'Test' }
    user = await prisma.session_userprofile.create({ data: profile })
    otherUser = await prisma.session_userprofile.create({ data: profile })
    departmentId = 2000000000 + user.id
    await prisma.subject_department.create({ data: { id: departmentId, num_id: 'TEST', code: 'TEST', name: '테스트', name_en: 'Test', visible: true } })
    const score = { grade: 0, load: 0, speech: 0, grade_sum: 0, load_sum: 0, speech_sum: 0, review_total_weight: 0 }
    const course = await prisma.subject_course.create({ data: {
      ...score, department_id: departmentId, old_code: 'TEST101', new_code: 'TEST101',
      title: '테스트 강의', title_en: 'HTTP lecture', title_no_space: '테스트강의', title_en_no_space: 'HTTPlecture',
      type: '전공선택', type_en: 'Major Elective', summury: '',
    } })
    courseId = course.id
    const lecture = await prisma.subject_lecture.create({ data: {
      ...score, ...term, department_id: departmentId, course_id: courseId,
      code: 'HTTP', old_code: 'TEST101', new_code: 'TEST101', class_no: 'A',
      title: '테스트 강의', title_en: 'HTTP lecture', title_no_space: '테스트강의', title_en_no_space: 'HTTPlecture',
      common_title: '테스트 강의', common_title_en: 'HTTP lecture', type: '전공선택', type_en: 'Major Elective',
      audience: 0, credit: 3, credit_au: 0, num_classes: 3, num_labs: 0, limit: 30, num_people: 0,
      is_english: false, deleted: false,
      subject_classtime: { create: { day: 0, begin: new Date('1970-01-01T09:00:00Z'), end: new Date('1970-01-01T10:00:00Z'), type: 'C' } },
    } })
    lectureId = lecture.id
    await prisma.session_userprofile_taken_lectures.create({ data: { userprofile_id: user.id, lecture_id: lectureId } })
  }, 30000)

  afterAll(async () => {
    // Optional local browser smoke test window; normal test runs close immediately.
    const port = Number(process.env.TIMETABLE_HTTP_PORT)
    if (port) {
      const stopFile = `/tmp/otl-timetable-http-${port}.stop`
      rmSync(stopFile, { force: true })
      await app.listen(port, '127.0.0.1')
      writeFileSync(`/tmp/otl-timetable-http-${port}.json`, JSON.stringify({ port, userId: user.id, lectureId, year: term.year, semester: term.semester }))
      console.log(`Local timetable HTTP server ready on ${port}; create ${stopFile} to close and clean fixtures`)
      await new Promise<void>((resolve) => {
        const timer = setInterval(() => {
          if (existsSync(stopFile)) finish()
        }, 250)
        const timeout = setTimeout(finish, 840000)
        function finish() {
          clearInterval(timer)
          clearTimeout(timeout)
          resolve()
        }
      })
      rmSync(stopFile, { force: true })
      rmSync(`/tmp/otl-timetable-http-${port}.json`, { force: true })
    }
    for (const profile of [user, otherUser].filter(Boolean)) {
      for (const table of await timetables.getTimetableBasics(profile)) {
        const items = await timetables.getTimeTableWithItemsById(table.id)
        items.timetable_timetable_customblocks.forEach((entry) => customIds.add(entry.custom_block_id))
        await timetables.deleteById(table.id, profile.id)
      }
      await prisma.session_userprofile_taken_lectures.deleteMany({ where: { userprofile_id: profile.id } })
      await prisma.session_userprofile.delete({ where: { id: profile.id } })
    }
    if (lectureId) {
      await prisma.subject_classtime.deleteMany({ where: { lecture_id: lectureId } })
      await prisma.subject_lecture.delete({ where: { id: lectureId } })
    }
    if (courseId) await prisma.subject_course.delete({ where: { id: courseId } })
    if (departmentId) await prisma.subject_department.delete({ where: { id: departmentId } })
    await prisma?.block_custom_blocks.deleteMany({ where: { id: { in: [...customIds] } } })
    await app?.close()
  }, process.env.TIMETABLE_HTTP_PORT ? 900000 : 30000)

  async function create(lectureIds: number[] = []) {
    const response = await request(app.getHttpServer()).post(prefix).send({ ...term, lectureIds }).expect(201)
    return response.body.id as number
  }

  it('preserves old create, lecture PATCH, custom CRUD and additive detail responses', async () => {
    const id = await create()
    const url = `${prefix}/${id}`
    expect((await request(app.getHttpServer()).get(url).expect(200)).body).toEqual({ lectures: [], timetableItems: [] })
    await request(app.getHttpServer()).patch(url).send({ lectureId, action: 'add' }).expect(200)
    const oldLecture = (await request(app.getHttpServer()).get(url).set('Accept-Language', 'en').expect(200)).body.lectures[0]
    expect(oldLecture).toMatchObject({ id: lectureId, name: 'HTTP lecture' })
    const added = await request(app.getHttpServer()).post(`${url}/custom-blocks`).send(block).expect(201)
    customIds.add(added.body.id)
    await request(app.getHttpServer()).patch(`${url}/custom-blocks/${added.body.id}`).send({ block_name: 'Renamed' }).expect(200)
    const oldBlocks = (await request(app.getHttpServer()).get(`${url}/custom-blocks`).expect(200)).body.custom_blocks
    expect(oldBlocks).toEqual([{ ...block, id: added.body.id, block_name: 'Renamed', times: [blockTime] }])
    const detail = (await request(app.getHttpServer()).get(url).set('Accept-Language', 'en').expect(200)).body
    expect(detail.lectures).toEqual([oldLecture])
    expect(detail.timetableItems).toEqual([{ kind: 'lecture', data: oldLecture }, { kind: 'custom', data: oldBlocks[0] }])
    await request(app.getHttpServer()).delete(`${url}/custom-blocks/${added.body.id}`).expect(200)
    await request(app.getHttpServer()).patch(url).send({ lectureId, action: 'delete' }).expect(200)
    await request(app.getHttpServer()).delete(prefix).send({ id }).expect(200)
  })

  it('accepts one or many body changes and evaluates replacement collisions against the final state', async () => {
    const id = await create()
    const url = `${prefix}/${id}/items`
    const added = (await request(app.getHttpServer()).patch(url).send({ changes: [{ op: 'add', kind: 'lecture', lectureId }] }).expect(200)).body
    expect(added.results).toEqual([{ index: 0, kind: 'lecture', id: lectureId }])
    const replacement = { ...block, day: 0, begin: 540, end: 600 }
    const replaced = (await request(app.getHttpServer()).patch(url).send({ changes: [
      { op: 'add', kind: 'custom', data: replacement }, { op: 'remove', kind: 'lecture', id: lectureId },
    ] }).expect(200)).body
    customIds.add(replaced.results[0].id)
    expect(replaced.timetableItems).toEqual([{ kind: 'custom', data: { id: replaced.results[0].id, ...replacement, times: [{ day: 0, begin: 540, end: 600 }] } }])
    await request(app.getHttpServer()).patch(url).send({ changes: [{ op: 'add', kind: 'lecture', lectureId }] }).expect(409)
    const current = (await request(app.getHttpServer()).get(`${prefix}/${id}`).expect(200)).body
    expect(current.timetableItems).toEqual(replaced.timetableItems)
  })

  it.each([
    {}, { changes: [] }, { changes: {} }, { changes: [null] },
    { changes: [{ op: 'update', kind: 'lecture', id: 1, data: {} }] },
    { changes: [{ op: 'add', kind: 'custom', data: { ...block, day: 7 } }] },
    { changes: [{ op: 'add', kind: 'custom', data: { ...block, begin: 660, end: 600 } }] },
  ])('rejects malformed JSON change bodies: %j', async (body) => {
    const id = await create()
    await request(app.getHttpServer()).patch(`${prefix}/${id}/items`).send(body).expect(400)
  })

  it('returns 404 for missing timetable IDs in new writes', async () => {
    const missingId = 2147483647
    await request(app.getHttpServer()).patch(`${prefix}/${missingId}/items`)
      .send({ changes: [{ op: 'add', kind: 'custom', data: block }] }).expect(404)
    await request(app.getHttpServer()).patch(`${prefix}/home`)
      .send({ ...term, timetableId: missingId }).expect(404)
    await request(app.getHttpServer()).post(prefix)
      .send({ ...term, sourceTimetableId: missingId }).expect(404)
  })

  it('clones lecture and block content independently through the existing POST', async () => {
    const id = await create([lectureId])
    const added = (await request(app.getHttpServer()).post(`${prefix}/${id}/custom-blocks`).send(block).expect(201)).body
    customIds.add(added.id)
    const cloneId = (await request(app.getHttpServer()).post(prefix).send({ ...term, sourceTimetableId: id }).expect(201)).body.id
    const clone = (await request(app.getHttpServer()).get(`${prefix}/${cloneId}`).expect(200)).body
    expect(clone.lectures.map((lecture: { id: number }) => lecture.id)).toEqual([lectureId])
    const copied = clone.timetableItems.find((item: { kind: string }) => item.kind === 'custom').data
    customIds.add(copied.id)
    expect(copied).toEqual({ ...block, id: copied.id, times: [blockTime] })
    expect(copied.id).not.toBe(added.id)
    await request(app.getHttpServer()).patch(`${prefix}/${cloneId}/items`).send({ changes: [{ op: 'update', kind: 'custom', id: copied.id, data: { block_name: 'Copy' } }] }).expect(200)
    const original = (await request(app.getHttpServer()).get(`${prefix}/${id}/custom-blocks`).expect(200)).body
    expect(original.custom_blocks[0].block_name).toBe(block.block_name)
    await request(app.getHttpServer()).post(prefix).send({ ...term, sourceTimetableId: id, lectureIds: [] }).expect(400)
    await request(app.getHttpServer()).post(prefix).send({ ...term, semester: 1, sourceTimetableId: id }).expect(400)
    await request(app.getHttpServer()).post(prefix).set('x-test-other-user', '1').send({ ...term, sourceTimetableId: id }).expect(403)
  })

  it('persists the first saved timetable as home, replaces it on deletion, and only falls back when empty', async () => {
    const homeTerm = { year: 2027, semester: 3 }
    const getHome = () => request(app.getHttpServer()).get(`${prefix}/home`).query(homeTerm).expect(200)
    const createHome = () => request(app.getHttpServer()).post(prefix).send({ ...homeTerm, lectureIds: [] }).expect(201)
    const selection = () => prisma.timetable_home_selection.findUnique({ where: {
      user_id_year_semester: { user_id: user.id, ...homeTerm },
    } })
    expect((await getHome()).body).toMatchObject({ source: 'enrolled', timetableId: null })
    const first = (await createHome()).body.id
    expect((await selection())?.timetable_id).toBe(first)
    const second = (await createHome()).body.id
    expect((await selection())?.timetable_id).toBe(first)
    expect((await getHome()).body).toMatchObject({ source: 'saved', timetableId: first })
    await request(app.getHttpServer()).patch(`${prefix}/home`).send({ ...homeTerm, timetableId: second }).expect(200)
    expect((await selection())?.timetable_id).toBe(second)
    await request(app.getHttpServer()).patch(`${prefix}/home`).send({ ...homeTerm, timetableId: null }).expect(400)
    await request(app.getHttpServer()).patch(`${prefix}/home`).send(homeTerm).expect(400)
    await request(app.getHttpServer()).patch(`${prefix}/home`).send({ ...homeTerm, semester: 1, timetableId: second }).expect(400)
    await request(app.getHttpServer()).patch(`${prefix}/home`).set('x-test-other-user', '1').send({ ...homeTerm, timetableId: second }).expect(403)
    await timetables.deleteById(second, user.id)
    expect((await selection())?.timetable_id).toBe(first)
    await request(app.getHttpServer()).delete(prefix).send({ id: first }).expect(200)
    expect(await selection()).toBeNull()
    expect((await getHome()).body).toMatchObject({ source: 'enrolled', timetableId: null })
    const recreated = (await createHome()).body.id
    expect((await selection())?.timetable_id).toBe(recreated)
  })

  it('serializes first creation and main deletion without losing the main choice', async () => {
    const concurrentTerm = { year: 2028, semester: 1 }
    const creates = await Promise.all([0, 1, 2].map(() => request(app.getHttpServer()).post(prefix)
      .send({ ...concurrentTerm, lectureIds: [] }).expect(201)))
    const tables = await prisma.timetable_timetable.findMany({ where: { user_id: user.id, ...concurrentTerm }, orderBy: { arrange_order: 'asc' } })
    const selection = () => prisma.timetable_home_selection.findUnique({ where: { user_id_year_semester: { user_id: user.id, ...concurrentTerm } } })
    expect(creates.map(({ body }) => body.id).sort()).toEqual(tables.map(({ id }) => id).sort())
    expect(tables.map(({ arrange_order }) => arrange_order)).toEqual([0, 1, 2])
    expect((await selection())?.timetable_id).toBe(tables[0].id)
    await Promise.all([
      request(app.getHttpServer()).delete(prefix).send({ id: tables[0].id }).expect(200),
      request(app.getHttpServer()).post(prefix).send({ ...concurrentTerm, lectureIds: [] }).expect(201),
    ])
    expect((await selection())?.timetable_id).toBe(tables[1].id)
  })

  it('shares exactly one timetable per term, restricts friend reads, and clears sharing after deletion', async () => {
    const first = await create([lectureId])
    const second = await create()
    const friendRepository = new FriendRepository({ tx: prisma } as never)
    await friendRepository.createPair(otherUser.id, user.id)
    const friend = (await friendRepository.getFriendByTarget(otherUser.id, user.id))!
    const friendsService = new FriendsService(friendRepository, lectures, timetables, {} as SemesterRepository)
    const shared = () => request(app.getHttpServer()).get(`${prefix}/shared`).query(term).expect(200)
    const select = (timetableId: number | null) => request(app.getHttpServer()).patch(`${prefix}/shared`).send({ ...term, timetableId }).expect(200)
    expect((await shared()).body).toMatchObject({ ...term, timetableId: null, source: 'enrolled', lectures: [{ id: lectureId }] })
    expect(await timetables.getSharedTimetables(user.id, term.year, term.semester)).toEqual([])
    expect((await friendsService.getOverlaps(otherUser, lectureId)).sameLecture.map(({ id }) => id)).toEqual([friend.id])
    expect(await friendRepository.getFriendIdsWithScheduleAt(otherUser.id, [friend.id], [term], 0, 570)).toEqual([friend.id])
    await request(app.getHttpServer()).patch(`${prefix}/home`).send({ ...term, timetableId: first }).expect(200)
    expect((await friendsService.getMyTimetable(otherUser, friend.id, term, 'en')).lectures.map(({ id }) => id)).toEqual([lectureId])
    await select(first)
    await expect(friendsService.getMyTimetable(otherUser, friend.id, term, 'en')).rejects.toThrow('Enrolled timetable is not shared')
    expect((await timetables.getSharedTimetables(user.id, term.year, term.semester)).map(({ id }) => id)).toEqual([first])
    expect(await timetables.getSharedTimetableWithItems(second, user.id)).toBeNull()
    expect(await timetables.getSharedTimetableWithItems(first, otherUser.id)).toBeNull()
    expect((await friendRepository.getFriendsWithCourse(otherUser.id, courseId)).map(({ id }) => id)).toEqual([friend.id])
    expect(await friendRepository.getFriendIdsWithScheduleAt(otherUser.id, [friend.id], [term], 0, 570)).toEqual([friend.id])
    await select(second)
    expect(await timetables.getSharedTimetableWithItems(first, user.id)).toBeNull()
    expect((await timetables.getSharedTimetables(user.id, term.year, term.semester)).map(({ id }) => id)).toEqual([second])
    expect(await friendsService.getOverlaps(otherUser, lectureId)).toEqual({ sameLecture: [], sameCourseDifferentSection: [], previousSemesterSameProfessor: [] })
    expect(await friendRepository.getFriendIdsWithScheduleAt(otherUser.id, [friend.id], [term], 0, 570)).toEqual([])
    const added = (await request(app.getHttpServer()).post(`${prefix}/${second}/custom-blocks`)
      .send({ ...block, times: [blockTime, { day: 4, begin: 700, end: 760 }] }).expect(201)).body
    customIds.add(added.id)
    expect(await friendRepository.getFriendIdsWithScheduleAt(otherUser.id, [friend.id], [term], 4, 730)).toEqual([friend.id])
    expect((await request(app.getHttpServer()).get(`${prefix}/home`).query(term).expect(200)).body.timetableId).toBe(first)
    await request(app.getHttpServer()).patch(`${prefix}/shared`).set('x-test-other-user', '1').send({ ...term, timetableId: first }).expect(403)
    await request(app.getHttpServer()).patch(`${prefix}/shared`).send({ ...term, semester: 1, timetableId: first }).expect(400)
    await request(app.getHttpServer()).patch(`${prefix}/shared`).send({ ...term, timetableId: 2147483647 }).expect(404)
    for (const body of [term, { ...term, timetableId: 0 }, { ...term, timetableId: '1' }, { ...term, year: 2026.5, timetableId: first }]) {
      await request(app.getHttpServer()).patch(`${prefix}/shared`).send(body).expect(400)
    }
    const spring = (await request(app.getHttpServer()).post(prefix).send({ ...term, semester: 1, lectureIds: [] }).expect(201)).body.id
    await request(app.getHttpServer()).patch(`${prefix}/shared`).send({ ...term, semester: 1, timetableId: spring }).expect(200)
    await select(null)
    expect((await shared()).body).toMatchObject({ timetableId: null, source: 'enrolled', lectures: [{ id: lectureId }] })
    expect(await prisma.timetable_shared_selection.count({ where: { user_id: user.id, ...term } })).toBe(0)
    expect(await friendRepository.getFriendIdsWithScheduleAt(otherUser.id, [friend.id], [term], 0, 570)).toEqual([friend.id])
    expect(await friendRepository.getFriendIdsWithScheduleAt(otherUser.id, [friend.id], [term], 4, 730)).toEqual([])
    // Simultaneous first-time requests still leave a single shared timetable.
    await prisma.timetable_shared_selection.deleteMany({ where: { user_id: user.id, ...term } })
    await Promise.all([select(first), select(second)])
    const winner = (await shared()).body.timetableId
    expect([first, second]).toContain(winner)
    expect(await prisma.timetable_shared_selection.count({ where: { user_id: user.id, ...term } })).toBe(1)
    await request(app.getHttpServer()).delete(prefix).send({ id: winner }).expect(200)
    expect((await shared()).body).toMatchObject({ timetableId: null, source: 'enrolled', lectures: [{ id: lectureId }] })
    expect(await prisma.timetable_shared_selection.count({ where: { user_id: user.id, ...term } })).toBe(0)
    expect(await friendRepository.getFriendIdsWithScheduleAt(otherUser.id, [friend.id], [term], 0, 570)).toEqual([friend.id])
    expect((await request(app.getHttpServer()).get(`${prefix}/shared`).query({ ...term, semester: 1 }).expect(200)).body.timetableId).toBe(spring)
    await friendRepository.deletePair(otherUser.id, user.id)
  })

  it('stores one grouped block, preserves legacy edits, clones and restores all times', async () => {
    const id = await create()
    const url = `${prefix}/${id}`
    const times = [blockTime, { day: 3, begin: 720, end: 780 }]
    const added = (await request(app.getHttpServer()).patch(`${url}/items`).send({
      changes: [{ op: 'add', kind: 'custom', data: { ...block, times } }],
    }).expect(200)).body
    const customId = added.results[0].id
    customIds.add(customId)
    expect(added.timetableItems).toEqual([{ kind: 'custom', data: { ...block, id: customId, times } }])
    expect(await prisma.block_custom_block_times.count({ where: { custom_block_id: customId } })).toBe(2)

    await request(app.getHttpServer()).patch(`${url}/custom-blocks/${customId}`).send({ block_name: 'Grouped' }).expect(200)
    await request(app.getHttpServer()).patch(`${url}/custom-blocks/${customId}`).send({ begin: 630 }).expect(200)
    const editedTimes = [{ ...blockTime, begin: 630 }, times[1]]
    const getBlock = async () => (await request(app.getHttpServer()).get(`${url}/custom-blocks`).expect(200)).body.custom_blocks[0]
    expect(await getBlock()).toEqual({ ...block, id: customId, block_name: 'Grouped', begin: 630, times: editedTimes })
    await request(app.getHttpServer()).patch(`${url}/custom-blocks/${customId}`)
      .send({ day: 3, begin: 750, end: 810 }).expect(400)
    expect((await getBlock()).times).toEqual(editedTimes)

    const replacement = [{ day: 4, begin: 840, end: 900 }, { day: 4, begin: 930, end: 990 }]
    await request(app.getHttpServer()).patch(`${url}/items`).send({ changes: [
      { op: 'update', kind: 'custom', id: customId, data: { times: replacement } },
    ] }).expect(200)
    const updated = await getBlock()
    expect(updated).toEqual({ ...block, id: customId, block_name: 'Grouped', ...replacement[0], times: replacement })
    const home = (await request(app.getHttpServer()).patch(`${prefix}/home`).send({ ...term, timetableId: id }).expect(200)).body
    expect(home.timetableItems).toEqual([{ kind: 'custom', data: updated }])

    const cloneId = (await request(app.getHttpServer()).post(prefix).send({ ...term, sourceTimetableId: id }).expect(201)).body.id
    const copy = (await request(app.getHttpServer()).get(`${prefix}/${cloneId}/custom-blocks`).expect(200)).body.custom_blocks[0]
    customIds.add(copy.id)
    expect(copy).toEqual({ ...updated, id: copy.id })
    expect(copy.id).not.toBe(customId)
    await request(app.getHttpServer()).patch(`${url}/items`).send({ changes: [{ op: 'remove', kind: 'custom', id: customId }] }).expect(200)
    expect((await request(app.getHttpServer()).get(url).expect(200)).body.timetableItems).toEqual([])
    const { id: _oldId, ...restore } = updated
    const restored = (await request(app.getHttpServer()).patch(`${url}/items`).send({ changes: [
      { op: 'add', kind: 'custom', data: restore },
    ] }).expect(200)).body
    customIds.add(restored.results[0].id)
    expect(restored.timetableItems[0].data).toEqual({ ...updated, id: restored.results[0].id })
    expect(restored.results[0].id).not.toBe(customId)
  })

  it('normalizes pre-migration rows and rejects collisions in non-first occurrences atomically', async () => {
    const id = await create([lectureId])
    const legacy = await prisma.block_custom_blocks.create({ data: block })
    customIds.add(legacy.id)
    await prisma.timetable_timetable_customblocks.create({ data: { timetable_id: id, custom_block_id: legacy.id } })
    const url = `${prefix}/${id}`
    const listed = (await request(app.getHttpServer()).get(`${url}/custom-blocks`).expect(200)).body.custom_blocks
    expect(listed).toEqual([{ ...block, id: legacy.id, times: [blockTime] }])
    const data = { ...block, day: 2, times: [{ ...blockTime, day: 2 }, { day: 0, begin: 570, end: 630 }] }
    await request(app.getHttpServer()).patch(`${url}/items`).send({ changes: [
      { op: 'remove', kind: 'custom', id: legacy.id }, { op: 'add', kind: 'custom', data },
    ] }).expect(409)
    expect((await request(app.getHttpServer()).get(`${url}/custom-blocks`).expect(200)).body.custom_blocks).toEqual(listed)
    await request(app.getHttpServer()).post(`${url}/custom-blocks`).send(data).expect(409)
    await request(app.getHttpServer()).patch(`${url}/items`).send({ changes: [
      { op: 'update', kind: 'custom', id: legacy.id, data: { times: [blockTime, { day: 0, begin: 570, end: 630 }] } },
    ] }).expect(409)
    expect(await prisma.block_custom_block_times.count({ where: { custom_block_id: legacy.id } })).toBe(0)
  })


  it('reflects old-server parent-only time edits even after child rows exist', async () => {
    for (const times of [[blockTime], [blockTime, { day: 3, begin: 720, end: 780 }]]) {
      const id = await create()
      const url = `${prefix}/${id}`
      const added = (await request(app.getHttpServer()).patch(`${url}/items`).send({
        changes: [{ op: 'add', kind: 'custom', data: { ...block, times } }],
      }).expect(200)).body
      const customId = added.results[0].id
      customIds.add(customId)
      // Emulate an older backend process: it knows no child table and updates only the parent.
      const first = { day: 2, begin: 840, end: 900 }
      await prisma.block_custom_blocks.update({ where: { id: customId }, data: first })
      const expected = { ...block, id: customId, ...first, times: [first, ...times.slice(1)] }
      const listed = (await request(app.getHttpServer()).get(`${url}/custom-blocks`).expect(200)).body.custom_blocks
      const detail = (await request(app.getHttpServer()).get(url).expect(200)).body
      expect(listed).toEqual([expected])
      expect(detail.timetableItems).toEqual([{ kind: 'custom', data: expected }])
      // A new-server metadata edit must keep the old-server time, not restore the stale child time.
      await request(app.getHttpServer()).patch(`${url}/custom-blocks/${customId}`).send({ place: 'Updated' }).expect(200)
      const updated = (await request(app.getHttpServer()).get(`${url}/custom-blocks`).expect(200)).body.custom_blocks
      expect(updated).toEqual([{ ...expected, place: 'Updated' }])
    }
  })

})
