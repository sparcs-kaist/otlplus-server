import { BadRequestException, ConflictException, ForbiddenException } from '@nestjs/common'
import { session_userprofile } from '@prisma/client'

import { CustomblockRepository, LectureRepository, TimetableRepository } from '@otl/prisma-client'
import { ELecture } from '@otl/prisma-client/entities/ELecture'
import { ETimetable } from '@otl/prisma-client/entities/ETimetable'

import { TimetablesServiceV2 } from './timetables.service'

// Transaction isolation/rollback is covered by the repository integration test.
jest.mock('@nestjs-cls/transactional', () => ({ Transactional: () => () => undefined }))
jest.mock('@otl/prisma-client', () => ({
  CustomblockRepository: class {},
  LectureRepository: class {},
  TimetableRepository: class {},
}), { virtual: true })
jest.mock('@otl/common/logger/logger', () => ({ __esModule: true, default: { error: jest.fn() } }))

const user = { id: 7 } as session_userprofile
const term = { year: 2026, semester: 3 }
const customInput = { block_name: 'Study', place: 'Library', day: 0, begin: 540, end: 600 }
const block = { id: 11, ...customInput }

function lecture(id: number, day = 0, begin = 540, end = 600): ELecture.Details {
  return {
    id,
    ...term,
    common_title: '강의',
    common_title_en: 'Lecture',
    title: '강의',
    title_en: 'Lecture',
    subject_department: { id: 1, name: '학과', name_en: 'Department' },
    subject_lecture_professors: [],
    subject_examtime: [],
    subject_classtime: [{
      day,
      begin: new Date(Date.UTC(1970, 0, 1, 0, begin)),
      end: new Date(Date.UTC(1970, 0, 1, 0, end)),
    }],
  } as unknown as ELecture.Details
}

function timetable(lectures: ELecture.Details[] = [], blocks = [block]): ETimetable.WithItems {
  return {
    id: 42,
    user_id: user.id,
    ...term,
    name: 'Saved',
    arrange_order: 0,
    timetable_timetable_lectures: lectures.map((subject_lecture) => ({ subject_lecture })),
    timetable_timetable_customblocks: blocks.map((block_custom_blocks) => ({ block_custom_blocks })),
  } as unknown as ETimetable.WithItems
}

function setup(current = timetable()) {
  const repo = {
    lockTimetable: jest.fn().mockResolvedValue(undefined),
    getTimeTableWithItemsById: jest.fn().mockResolvedValue(current),
    getTimeTableBasicById: jest.fn().mockResolvedValue(current),
    getTimeTableById: jest.fn().mockResolvedValue(current),
    getLecturesByIds: jest.fn().mockResolvedValue([]),
    getTimetableBasics: jest.fn().mockResolvedValue([current]),
    createTimetable: jest.fn().mockResolvedValue({ id: 43 }),
    addLectureToTimetable: jest.fn().mockResolvedValue(undefined),
    removeLectureFromTimetable: jest.fn().mockResolvedValue(undefined),
    getHomeTimetable: jest.fn().mockResolvedValue(null),
    setHomeTimetable: jest.fn().mockResolvedValue(undefined),
  }
  const blocks = {
    createCustomblock: jest.fn().mockImplementation(async (data) => ({ id: 100, ...data })),
    addCustomblockToTimetable: jest.fn().mockResolvedValue(undefined),
    removeCustomblockFromTimetable: jest.fn().mockResolvedValue(undefined),
    updateCustomblock: jest.fn().mockImplementation(async (id, data) => ({ ...block, ...data, id })),
  }
  const lectures = { getTakenLecturesBySemester: jest.fn().mockResolvedValue([lecture(9)]) }
  const mq = { publishLectureNumUpdate: jest.fn().mockResolvedValue(undefined) }
  const service = new TimetablesServiceV2(
    repo as unknown as TimetableRepository,
    lectures as unknown as LectureRepository,
    mq,
    blocks as unknown as CustomblockRepository,
  )
  return { service, repo, blocks, lectures, mq }
}

describe('TimetablesServiceV2 unified items', () => {
  it('dispatches every kind/operation and preserves result order in a mixed batch', async () => {
    const { service, repo, blocks, mq } = setup(timetable([lecture(11)], [block, { ...block, id: 12, day: 1 }]))
    repo.getLecturesByIds.mockResolvedValue([lecture(13, 2)])
    const addedBlock = { ...customInput, day: 3 }
    const result = await service.updateTimetableItems(user, {
      changes: [
        { op: 'add', kind: 'lecture', lectureId: 13 },
        { op: 'add', kind: 'custom', data: addedBlock },
        { op: 'remove', kind: 'lecture', id: 11 },
        { op: 'remove', kind: 'custom', id: 11 },
        { op: 'update', kind: 'custom', id: 12, data: { day: 4 } },
      ],
    }, 42, 'en')

    expect(repo.getLecturesByIds).toHaveBeenCalledWith([13])
    expect(repo.addLectureToTimetable).toHaveBeenCalledWith(42, 13)
    expect(blocks.createCustomblock).toHaveBeenCalledWith(addedBlock)
    expect(blocks.addCustomblockToTimetable).toHaveBeenCalledWith(42, 100)
    expect(repo.removeLectureFromTimetable).toHaveBeenCalledWith(42, 11)
    expect(blocks.removeCustomblockFromTimetable).toHaveBeenCalledWith(42, 11)
    expect(blocks.updateCustomblock).toHaveBeenCalledWith(12, { day: 4 })
    expect(result.results).toEqual([
      { index: 0, kind: 'lecture', id: 13 },
      { index: 1, kind: 'custom', id: 100 },
      { index: 2, kind: 'lecture', id: 11 },
      { index: 3, kind: 'custom', id: 11 },
      { index: 4, kind: 'custom', id: 12 },
    ])
    expect(mq.publishLectureNumUpdate.mock.calls).toEqual([[13], [11]])
  })

  it('checks collisions against the final state when a batch replaces a lecture with a block', async () => {
    const { service, repo, blocks } = setup(timetable([lecture(11)], []))
    const result = await service.updateTimetableItems(user, {
      changes: [
        { op: 'add', kind: 'custom', data: customInput },
        { op: 'remove', kind: 'lecture', id: 11 },
      ],
    }, 42, 'en')

    expect(repo.removeLectureFromTimetable).toHaveBeenCalledWith(42, 11)
    expect(blocks.addCustomblockToTimetable).toHaveBeenCalledWith(42, 100)
    expect(result.results).toEqual([
      { index: 0, kind: 'custom', id: 100 },
      { index: 1, kind: 'lecture', id: 11 },
    ])
  })

  it('distinguishes a lecture and a custom block that have the same numeric ID', async () => {
    const { service, repo, blocks } = setup(timetable([lecture(11)]))
    await service.updateTimetableItems(user, {
      changes: [
        { op: 'remove', kind: 'lecture', id: 11 },
        { op: 'remove', kind: 'custom', id: 11 },
      ],
    }, 42, 'en')

    expect(repo.removeLectureFromTimetable).toHaveBeenCalledWith(42, 11)
    expect(blocks.removeCustomblockFromTimetable).toHaveBeenCalledWith(42, 11)
  })

  it('allows a metadata edit despite an existing lecture/block overlap', async () => {
    const { service, blocks } = setup(timetable([lecture(11)]))
    await service.updateTimetableItems(user, {
      changes: [{ op: 'update', kind: 'custom', id: 11, data: { block_name: 'Renamed' } }],
    }, 42, 'en')

    expect(blocks.updateCustomblock).toHaveBeenCalledWith(11, expect.objectContaining({ block_name: 'Renamed' }))
  })

  it.each(['lecture', 'custom'] as const)('rejects a new %s overlapping the other kind before writes', async (kind) => {
    const { service, repo, blocks } = setup(kind === 'lecture' ? timetable() : timetable([lecture(12)], []))
    repo.getLecturesByIds.mockResolvedValue([lecture(12)])
    const change = kind === 'lecture'
      ? { op: 'add' as const, kind, lectureId: 12 }
      : { op: 'add' as const, kind, data: customInput }

    await expect(service.updateTimetableItems(user, { changes: [change] }, 42, 'en'))
      .rejects.toBeInstanceOf(ConflictException)
    expect(repo.addLectureToTimetable).not.toHaveBeenCalled()
    expect(blocks.createCustomblock).not.toHaveBeenCalled()
  })

  it('allows unrelated additions while keeping a legacy overlap', async () => {
    const { service, blocks } = setup(timetable([lecture(12)]))
    await service.updateTimetableItems(user, {
      changes: [{ op: 'add', kind: 'custom', data: { ...customInput, day: 1 } }],
    }, 42, 'en')

    expect(blocks.createCustomblock).toHaveBeenCalledTimes(1)
  })

  it('rejects edits to another user’s timetable', async () => {
    const { service, blocks } = setup({ ...timetable(), user_id: 8 })
    await expect(service.updateTimetableItems(user, {
      changes: [{ op: 'remove', kind: 'custom', id: 11 }],
    }, 42, 'en')).rejects.toBeInstanceOf(ForbiddenException)
    expect(blocks.removeCustomblockFromTimetable).not.toHaveBeenCalled()
  })

  it('rejects lectures from another semester', async () => {
    const { service, repo } = setup(timetable([], []))
    repo.getLecturesByIds.mockResolvedValue([{ ...lecture(12), semester: 1 }])
    await expect(service.updateTimetableItems(user, {
      changes: [{ op: 'add', kind: 'lecture', lectureId: 12 }],
    }, 42, 'en')).rejects.toBeInstanceOf(BadRequestException)
    expect(repo.addLectureToTimetable).not.toHaveBeenCalled()
  })
})

describe('TimetablesServiceV2 clone compatibility', () => {
  it('clones overlapping contents using new custom block rows without selecting it for home', async () => {
    const { service, repo, blocks } = setup(timetable([lecture(11)]))
    await expect(service.createTimetable(user, { ...term, sourceTimetableId: 42 }, 'en'))
      .resolves.toEqual({ id: 43 })
    expect(blocks.createCustomblock).toHaveBeenCalledWith(customInput)
    expect(blocks.addCustomblockToTimetable).toHaveBeenCalledWith(43, 100)
    expect(blocks.addCustomblockToTimetable).not.toHaveBeenCalledWith(43, 11)
    expect(repo.setHomeTimetable).not.toHaveBeenCalled()
  })

  it('still creates an empty timetable with the old body', async () => {
    const { service, blocks } = setup()
    await expect(service.createTimetable(user, { ...term, lectureIds: [] }, 'en')).resolves.toEqual({ id: 43 })
    expect(blocks.createCustomblock).not.toHaveBeenCalled()
  })

  it.each([
    { user_id: 8 },
    { semester: 1 },
  ])('rejects cloning an inaccessible source: %o', async (override) => {
    const { service, repo } = setup({ ...timetable(), ...override })
    await expect(service.createTimetable(user, { ...term, sourceTimetableId: 42 }, 'en')).rejects.toThrow()
    expect(repo.createTimetable).not.toHaveBeenCalled()
  })

  it('rejects ambiguous clone and lecture-list arguments', async () => {
    const { service, repo } = setup()
    await expect(service.createTimetable(user, { ...term, sourceTimetableId: 42, lectureIds: [] }, 'en'))
      .rejects.toBeInstanceOf(BadRequestException)
    expect(repo.createTimetable).not.toHaveBeenCalled()
  })
})

describe('TimetablesServiceV2 home selection', () => {
  it.each([null, { timetable_id: null }])('falls back to enrolled lectures without a saved selection: %o', async (selection) => {
    const { service, repo, lectures } = setup()
    repo.getHomeTimetable.mockResolvedValue(selection)
    const result = await service.getHomeTimetable(user, term, 'en')
    expect(result).toMatchObject({ source: 'enrolled', timetableId: null, ...term })
    expect(result.timetableItems).toEqual([{ kind: 'lecture', data: expect.objectContaining({ id: 9 }) }])
    expect(lectures.getTakenLecturesBySemester).toHaveBeenCalledWith(user.id, term.year, term.semester)
  })

  it('returns a selected custom-only timetable without changing actual enrollment', async () => {
    const { service, repo, lectures } = setup()
    repo.getHomeTimetable.mockResolvedValue({ timetable_id: 42 })
    const result = await service.getHomeTimetable(user, term, 'en')
    expect(result).toMatchObject({ source: 'saved', timetableId: 42, name: 'Saved', ...term, lectures: [] })
    expect(result.timetableItems).toEqual([{ kind: 'custom', data: block }])
    expect(lectures.getTakenLecturesBySemester).not.toHaveBeenCalled()
  })

  it.each([{ user_id: 8 }, { semester: 1 }])('rejects selecting an inaccessible timetable: %o', async (override) => {
    const { service, repo } = setup({ ...timetable(), ...override })
    await expect(service.setHomeTimetable(user, { ...term, timetableId: 42 }, 'en')).rejects.toThrow()
    expect(repo.setHomeTimetable).not.toHaveBeenCalled()
  })

  it('clears only the requested user/semester selection', async () => {
    const { service, repo } = setup()
    await service.setHomeTimetable(user, { ...term, timetableId: null }, 'en')
    expect(repo.setHomeTimetable).toHaveBeenCalledWith(user.id, term.year, term.semester, null)
  })
})
