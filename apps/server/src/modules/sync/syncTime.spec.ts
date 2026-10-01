import { SyncRepository } from '@otl/prisma-client/repositories/sync.repository'
import { PrismaService } from '@otl/prisma-client/prisma.service'
import { ELecture } from '@otl/prisma-client/entities'

import { SlackNotiService } from './slackNoti.service'
import { SyncScholarDBService } from './syncScholarDB.service'

let prisma: PrismaService
jest.mock('@otl/prisma-client/prisma.service', () => ({ PrismaService: jest.fn() }))

it('routes exam and class changes through their matching typed repository methods', async () => {
  const begin = new Date('1970-01-01T09:00:00Z')
  const end = new Date('1970-01-01T10:00:00Z')
  const existing = { id: 1, day: 1, begin, end }
  const lecture = {
    id: 10, code: 'CS101', class_no: 'A', subject_examtime: [existing], subject_classtime: [existing],
  } as ELecture.Details
  prisma = new PrismaService({})
  const repository = new SyncRepository(prisma)
  jest.spyOn(repository, 'getExistingDetailedLectures').mockResolvedValue([lecture])
  const updateLectureExamtimes = jest.spyOn(repository, 'updateLectureExamtimes').mockResolvedValue()
  const updateLectureClasstimes = jest.spyOn(repository, 'updateLectureClasstimes').mockResolvedValue()
  const slack = new SlackNotiService()
  jest.spyOn(slack, 'sendSyncNoti').mockResolvedValue()
  const service = new SyncScholarDBService(repository, slack)
  const exam = await service.syncExamtime({ year: 2026, semester: 1, examtimes: [] })
  expect(updateLectureExamtimes).toHaveBeenCalledWith(10, { added: [], removed: [1] })
  expect(updateLectureClasstimes).not.toHaveBeenCalled()
  expect(exam.updated).toEqual([expect.objectContaining({ lecture: 'CS101', removed: [1] })])
  const classes = await service.syncClassTime({ year: 2026, semester: 1, classtimes: [] })
  expect(updateLectureClasstimes).toHaveBeenCalledWith(10, { added: [], removed: [1] })
  expect(classes.errors).toEqual([])
})
