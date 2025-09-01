import { INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { AppModule } from '@otl/server-nest/app.module'
import { ETimetable, PrismaService } from '@otl/prisma-client'

describe('AppController (e2e)', () => {
  let app: INestApplication

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleFixture.createNestApplication()
    await app.init()
  })

  it('/session/info (GET)', async () => {
    const prisma = app.get(PrismaService)
    const timetableId = 82
    return prisma.timetable_timetable_lectures.findMany({
      where: { timetable_id: timetableId },
      include: ETimetable.WithLectureClasstimes.include,
    })
  }, 100000000)
})
