import { INestApplication, Module, ValidationPipe } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { ClsPluginTransactional } from '@nestjs-cls/transactional'
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma'
import { session_userprofile } from '@prisma/client'
import { ClsModule } from 'nestjs-cls'
import { existsSync, rmSync, writeFileSync } from 'fs'
import request from 'supertest'

import { PrismaService } from '@otl/prisma-client/prisma.service'
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
const block = { block_name: 'HTTP fixture', place: 'Library', day: 1, begin: 600, end: 660 }

integration('Timetable HTTP compatibility (local MySQL)', () => {
  let app: INestApplication
  let prisma: PrismaService
  let timetables: TimetableRepository
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
        await timetables.deleteById(table.id)
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
    expect(oldBlocks).toEqual([{ ...block, id: added.body.id, block_name: 'Renamed' }])
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
    expect(replaced.timetableItems).toEqual([{ kind: 'custom', data: { id: replaced.results[0].id, ...replacement } }])
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
    expect(copied).toEqual({ ...block, id: copied.id })
    expect(copied.id).not.toBe(added.id)
    await request(app.getHttpServer()).patch(`${prefix}/${cloneId}/items`).send({ changes: [{ op: 'update', kind: 'custom', id: copied.id, data: { block_name: 'Copy' } }] }).expect(200)
    const original = (await request(app.getHttpServer()).get(`${prefix}/${id}/custom-blocks`).expect(200)).body
    expect(original.custom_blocks[0].block_name).toBe(block.block_name)
    await request(app.getHttpServer()).post(prefix).send({ ...term, sourceTimetableId: id, lectureIds: [] }).expect(400)
    await request(app.getHttpServer()).post(prefix).send({ ...term, semester: 1, sourceTimetableId: id }).expect(400)
    await request(app.getHttpServer()).post(prefix).set('x-test-other-user', '1').send({ ...term, sourceTimetableId: id }).expect(403)
  })

  it('persists home choice per user and semester, resets explicitly and falls back after legacy deletion', async () => {
    const getHome = () => request(app.getHttpServer()).get(`${prefix}/home`).query(term).expect(200)
    expect((await getHome()).body).toMatchObject({ source: 'enrolled', timetableId: null, lectures: [{ id: lectureId }] })
    const id = await create()
    const createdBlock = (await request(app.getHttpServer()).post(`${prefix}/${id}/custom-blocks`).send(block).expect(201)).body
    customIds.add(createdBlock.id)
    const selected = (await request(app.getHttpServer()).patch(`${prefix}/home`).send({ ...term, timetableId: id }).expect(200)).body
    expect(selected).toMatchObject({ source: 'saved', timetableId: id, lectures: [], timetableItems: [{ kind: 'custom' }] })
    expect((await getHome()).body).toEqual(selected)
    expect((await request(app.getHttpServer()).get(`${prefix}/home`).query({ ...term, semester: 1 }).expect(200)).body.source).toBe('enrolled')
    await request(app.getHttpServer()).patch(`${prefix}/home`).set('x-test-other-user', '1').send({ ...term, timetableId: id }).expect(403)
    await request(app.getHttpServer()).patch(`${prefix}/home`).send({ ...term, semester: 1, timetableId: id }).expect(400)
    await request(app.getHttpServer()).patch(`${prefix}/home`).send(term).expect(400)
    expect((await request(app.getHttpServer()).patch(`${prefix}/home`).send({ ...term, timetableId: null }).expect(200)).body.source).toBe('enrolled')
    await request(app.getHttpServer()).patch(`${prefix}/home`).send({ ...term, timetableId: id }).expect(200)
    await request(app.getHttpServer()).delete(prefix).send({ id }).expect(200)
    expect((await getHome()).body).toMatchObject({ source: 'enrolled', timetableId: null, lectures: [{ id: lectureId }] })
    expect((await request(app.getHttpServer()).get(`${prefix}/my-timetable`).query(term).expect(200)).body.timetableItems).toMatchObject([{ kind: 'lecture', data: { id: lectureId } }])
  })
})
