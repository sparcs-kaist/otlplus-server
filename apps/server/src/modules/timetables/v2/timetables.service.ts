import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common'
import { Transactional } from '@nestjs-cls/transactional'
import { Language } from '@otl/server-nest/common/decorators/get-language.decorator'
import { ICustomblock } from '@otl/server-nest/common/interfaces/ICustomblock'
import { ITimetableV2 } from '@otl/server-nest/common/interfaces/v2'
import {
  toJsonLectures,
  toJsonTimetableV2,
  toJsonTimetableV2WithItems,
} from '@otl/server-nest/common/serializer/v2/timetable.serializer'
import { TIMETABLE_MQ, TimetableMQ } from '@otl/server-nest/modules/timetables/domain/out/TimetableMQ'
import { Prisma, session_userprofile } from '@prisma/client'
import { match } from 'ts-pattern'

import { TimetableItemKind } from '@otl/common/enum/timetable'
import logger from '@otl/common/logger/logger'

import { CustomblockRepository, LectureRepository, TimetableRepository } from '@otl/prisma-client'
import { ECustomblock } from '@otl/prisma-client/entities/ECustomblock'

import {
  parseCustomblockData, parseTimetableChanges, validateCreateTimetableInput, validateCustomblockTimes,
} from './timetable-input'

@Injectable()
export class TimetablesServiceV2 {
  constructor(
    private readonly timetableRepository: TimetableRepository,
    private readonly lectureRepository: LectureRepository,
    @Inject(TIMETABLE_MQ)
    private readonly timetableMQ: TimetableMQ,
    private readonly customblockRepository: CustomblockRepository,
  ) {}

  async getTimetables(
    user: session_userprofile,
    query: ITimetableV2.GetTimetablesReqDto,
  ): Promise<ITimetableV2.GetTimetablesResDto> {
    const timetables = await this.timetableRepository.getTimetables(user, query.year, query.semester)
    return { timetables: timetables.map(toJsonTimetableV2) }
  }

  async getTimetablesBySemester(
    user: session_userprofile,
    query: ITimetableV2.GetTimetablesBySemesterReqDto,
  ): Promise<ITimetableV2.GetTimetablesBySemesterResDto> {
    const timetables = await this.timetableRepository.getTimetables(user, query.year, query.semester, {
      orderBy: [{ year: 'desc' }, { semester: 'desc' }, { arrange_order: 'asc' }],
    })

    // Group timetables by year and semester
    const semesterMap = new Map<string, ITimetableV2.SemesterTimetableGroup>()

    for (const timetable of timetables) {
      if (timetable.year === null || timetable.semester === null) continue

      const key = `${timetable.year}-${timetable.semester}`

      if (!semesterMap.has(key)) {
        semesterMap.set(key, {
          year: timetable.year,
          semester: timetable.semester,
          timetables: [],
        })
      }

      semesterMap.get(key)!.timetables.push({
        id: timetable.id,
        name: timetable.name ?? '',
      })
    }

    // Filter out semesters that have only one timetable and it has no lectures
    const semesters = Array.from(semesterMap.values()).filter((group) => {
      if (group.timetables.length !== 1) return true
      const timetable = timetables.find((t) => t.id === group.timetables[0].id)
      return timetable !== undefined && timetable.timetable_timetable_lectures.length > 0
    })

    return {
      semesters,
    }
  }

  async createTimetable(
    user: session_userprofile,
    body: ITimetableV2.CreateReqDto,
    language: Language,
  ): Promise<ITimetableV2.CreateResDto> {
    const { id, lectureIds } = await this.createTimetableInTransaction(user, body, language)
    await this.publishLectureUpdates(lectureIds)
    return { id }
  }

  @Transactional()
  private async createTimetableInTransaction(
    user: session_userprofile,
    body: ITimetableV2.CreateReqDto,
    language: Language,
  ) {
    const {
      year, semester, lectureIds, sourceTimetableId,
    } = body
    validateCreateTimetableInput(body)
    let source
    if (sourceTimetableId !== undefined) {
      await this.timetableRepository.lockTimetable(sourceTimetableId)
      await this.TimetableValidation(user, sourceTimetableId)
      source = await this.timetableRepository.getTimeTableWithItemsById(sourceTimetableId)
      if (source.year !== year || source.semester !== semester) {
        throw new BadRequestException('Source timetable must be in the requested year and semester')
      }
    }

    const relatedTimetables = await this.timetableRepository.getTimetableBasics(user, year, semester, {
      orderBy: { arrange_order: 'asc' },
    })
    const arrangeOrder = relatedTimetables.length > 0 ? relatedTimetables[relatedTimetables.length - 1].arrange_order + 1 : 0

    // Remove duplicate lecture IDs
    const uniqueLectureIds = Array.from(new Set(lectureIds ?? []))
    const lectures = source
      ? source.timetable_timetable_lectures.map(({ subject_lecture }) => subject_lecture)
      : uniqueLectureIds.length > 0 ? await this.timetableRepository.getLecturesByIds(uniqueLectureIds) : []

    // Save only lectures that match the year and semester with timetable
    const filteredLectures = lectures.filter((lecture) => lecture.year === year && lecture.semester === semester)

    const createdTimetable = await this.timetableRepository.createTimetable(
      user,
      year,
      semester,
      arrangeOrder,
      filteredLectures,
      language === 'en' ? `Timetable ${arrangeOrder + 1}` : `시간표 ${arrangeOrder + 1}`,
    )

    if (source) {
      for (const { block_custom_blocks } of source.timetable_timetable_customblocks) {
        const { id: _id, ...data } = ECustomblock.normalize(block_custom_blocks)
        const block = await this.customblockRepository.createCustomblock(data)
        await this.customblockRepository.addCustomblockToTimetable(createdTimetable.id, block.id)
      }
    }
    return { id: createdTimetable.id, lectureIds: filteredLectures.map(({ id }) => id) }
  }

  async deleteTimetable(
    user: session_userprofile,
    body: ITimetableV2.DeleteReqDto,
  ): Promise<ITimetableV2.DeleteResDto> {
    const lectureIds = await this.deleteTimetableInTransaction(user, body)
    await this.publishLectureUpdates(lectureIds)
    return { message: 'Timetable deleted successfully' }
  }

  @Transactional()
  private async deleteTimetableInTransaction(
    user: session_userprofile,
    body: ITimetableV2.DeleteReqDto,
  ): Promise<number[]> {
    const { id } = body
    // if timetableId is invalid, throw 400
    if (id === undefined) {
      throw new BadRequestException('Timetable ID is required')
    }

    try {
      await this.timetableRepository.lockTimetable(id)
      const timetable = await this.timetableRepository.getTimeTableById(id)
      // if user is not owner of timetable, throw 401
      if (timetable.user_id !== user.id) {
        throw new UnauthorizedException('Current user does not match owner of requested timetable')
      }

      const { year, semester, arrange_order } = timetable
      const lectureIds = await this.timetableRepository.getTimeTableLectures(id)

      await this.timetableRepository.deleteById(id)

      // update order of other timetables
      const relatedTimeTables = await this.timetableRepository.getTimetables(user, year, semester)
      const timeTablesToBeUpdated = relatedTimeTables
        .filter((timeTable) => timeTable.arrange_order > arrange_order)
        .map((timeTable) => ({
          id: timeTable.id,
          arrange_order: timeTable.arrange_order - 1,
        }))
      await Promise.all(
        timeTablesToBeUpdated.map(async (updateElem) => this.timetableRepository.updateOrder(updateElem.id, updateElem.arrange_order)),
      )

      return lectureIds
    }
    catch (error) {
      // catch prisma.timetable_timetable.findUniqueOrThrow() + not found, throw 400
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new BadRequestException('TimetableID is invalid')
        }
      }
      throw error
    }
  }

  // this updates name of timetable or order of timetable
  // at least one of name or order must be provided
  // throw 400 if neither is provided or id is invalid
  // throw 401 if user is unauthorized (if user.id !== timetable.user_id)
  // return 200 if successful, no content
  @Transactional()
  async updateTimetable(
    user: session_userprofile,
    body: ITimetableV2.UpdateReqDto,
  ): Promise<ITimetableV2.UpdateResDto> {
    const { id, name, order } = body
    try {
      if (name === undefined && order === undefined) {
        throw new BadRequestException('At least one of name or order must be provided')
      }

      await this.timetableRepository.lockTimetable(id)
      const timetable = await this.timetableRepository.getTimeTableById(id)
      if (timetable.user_id !== user.id) {
        throw new UnauthorizedException('Current user does not match owner of requested timetable')
      }

      // Handle name update
      if (name !== undefined) {
        await this.timetableRepository.updateName(id, name)
      }

      // Handle order update (complex reordering logic)
      if (order !== undefined) {
        const targetArrangeOrder = order

        // Early return if order hasn't changed
        if (targetArrangeOrder === timetable.arrange_order) {
          return {
            message: 'Timetable updated successfully',
          }
        }

        // Get all related timetables for validation and reordering
        const relatedTimeTables = await this.timetableRepository.getTimetables(user, timetable.year, timetable.semester)

        // Validate order bounds
        if (targetArrangeOrder < 0 || targetArrangeOrder >= relatedTimeTables.length) {
          throw new BadRequestException(`Invalid arrange_order: must be between 0 and ${relatedTimeTables.length - 1}`)
        }

        // Calculate which timetables need to be updated
        let timeTablesToBeUpdated: { id: number, arrange_order: number }[] = []

        if (targetArrangeOrder < timetable.arrange_order) {
          // Moving to earlier position: shift timetables between target and current position forward
          timeTablesToBeUpdated = relatedTimeTables
            .filter(
              (timeTable) => timeTable.arrange_order >= targetArrangeOrder && timeTable.arrange_order < timetable.arrange_order,
            )
            .map((timeTable) => ({
              id: timeTable.id,
              arrange_order: timeTable.arrange_order + 1,
            }))
        }
        else if (targetArrangeOrder > timetable.arrange_order) {
          // Moving to later position: shift timetables between current and target position backward
          timeTablesToBeUpdated = relatedTimeTables
            .filter(
              (timeTable) => timeTable.arrange_order <= targetArrangeOrder && timeTable.arrange_order > timetable.arrange_order,
            )
            .map((timeTable) => ({
              id: timeTable.id,
              arrange_order: timeTable.arrange_order - 1,
            }))
        }

        // Update other timetables first
        await Promise.all(
          timeTablesToBeUpdated.map(async (timetableToUpdate) => this.timetableRepository.updateOrder(timetableToUpdate.id, timetableToUpdate.arrange_order)),
        )

        // Finally update the target timetable
        await this.timetableRepository.updateOrder(id, targetArrangeOrder)
      }

      return {
        message: 'Timetable updated successfully',
      }
    }
    catch (error) {
      // catch prisma.timetable_timetable.findUniqueOrThrow() + not found, throw 400
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new BadRequestException('id of timetable is invalid')
        }
      }
      throw error
    }
  }

  @Transactional()
  async getTimetable(id: number, user: session_userprofile, language: Language): Promise<ITimetableV2.TimetableDetailResDto> {
    try {
      if (id === undefined) {
        throw new BadRequestException('id of timetable is required')
      }
      const timetable = await this.timetableRepository.getTimeTableWithItemsById(id)
      if (timetable.user_id !== user.id) {
        throw new UnauthorizedException('Current user does not match owner of requested timetable')
      }

      return toJsonTimetableV2WithItems(timetable, language)
    }
    catch (error) {
      // catch prisma.timetable_timetable.findUniqueOrThrow() + not found, throw 400
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new BadRequestException('id of timetable is invalid')
        }
      }
      throw error
    }
  }

  async updateTimetableLecture(
    user: session_userprofile,
    body: ITimetableV2.UpdateLectureReqDto,
    timetableId: number,
  ): Promise<ITimetableV2.UpdateLectureResDto> {
    const result = await this.updateTimetableLectureInTransaction(user, body, timetableId)
    await this.publishLectureUpdates([body.lectureId])
    return result
  }

  @Transactional()
  private async updateTimetableLectureInTransaction(
    user: session_userprofile,
    body: ITimetableV2.UpdateLectureReqDto,
    timetableId: number,
  ): Promise<ITimetableV2.UpdateLectureResDto> {
    const { lectureId, action } = body
    try {
      if (lectureId === undefined) {
        throw new BadRequestException('lectureId is required')
      }
      if (action === undefined) {
        throw new BadRequestException('action is required')
      }

      await this.timetableRepository.lockTimetable(timetableId)

      // Fetch lecture first - catch invalid lectureId
      let lecture
      try {
        lecture = await this.lectureRepository.getLectureBasicById(lectureId)
      }
      catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
          throw new BadRequestException('lectureId is invalid')
        }
        throw error
      }

      // Fetch timetable - catch invalid timetableId
      let timetable
      try {
        timetable = await this.timetableRepository.getTimeTableById(timetableId)
      }
      catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
          throw new BadRequestException('timetableId is invalid')
        }
        throw error
      }

      if (lecture.year !== timetable.year || lecture.semester !== timetable.semester) {
        throw new BadRequestException('lecture and timetable are not in the same year and semester')
      }

      // Check access - return 403 if user doesn't own timetable
      if (timetable.user_id !== user.id) {
        throw new ForbiddenException('Current user does not match owner of requested timetable')
      }

      if (action === 'add') {
        await this.timetableRepository.addLectureToTimetable(timetable.id, lectureId)
      }
      else if (action === 'delete') {
        await this.timetableRepository.removeLectureFromTimetable(timetable.id, lectureId)
      }
      return {
        message: 'Timetable lecture updated successfully',
      }
    }
    catch (error) {
      // Re-throw if it's already a HttpException (BadRequestException, ForbiddenException, etc.)
      if (error instanceof BadRequestException || error instanceof ForbiddenException) {
        throw error
      }
      // Catch any other Prisma errors
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new BadRequestException('Either lectureId or timetableId is invalid')
        }
      }
      throw error
    }
  }

  async updateTimetableItems(
    user: session_userprofile,
    body: ITimetableV2.UpdateItemsReqDto,
    timetableId: number,
    language: Language,
  ): Promise<ITimetableV2.UpdateItemsResDto> {
    const changes = parseTimetableChanges(body.changes)
    const result = await this.updateTimetableItemsInTransaction(user, changes, timetableId, language)
    await this.publishLectureUpdates(changes.flatMap((change) => match(change)
      .with({ kind: TimetableItemKind.LECTURE, op: 'add' }, ({ lectureId }) => [lectureId])
      .with({ kind: TimetableItemKind.LECTURE, op: 'remove' }, ({ id }) => [id])
      .with({ kind: TimetableItemKind.CUSTOM }, () => [])
      .exhaustive()))
    return result
  }

  @Transactional()
  private async updateTimetableItemsInTransaction(
    user: session_userprofile,
    changes: ITimetableV2.TimetableChange[],
    timetableId: number,
    language: Language,
  ): Promise<ITimetableV2.UpdateItemsResDto> {
    await this.timetableRepository.lockTimetable(timetableId)
    await this.TimetableValidation(user, timetableId)
    const timetable = await this.timetableRepository.getTimeTableWithItemsById(timetableId)
    const lectures = new Map(timetable.timetable_timetable_lectures.map(({ subject_lecture }) => [subject_lecture.id, subject_lecture]))
    const blocks = new Map(timetable.timetable_timetable_customblocks.map(({ block_custom_blocks }) => [block_custom_blocks.id, ECustomblock.normalize(block_custom_blocks)]))
    const addedLectureIds = changes.flatMap((change) => (change.op === 'add' && change.kind === TimetableItemKind.LECTURE
      ? [change.lectureId]
      : []))
    const addedLectures = await this.timetableRepository.getLecturesByIds(addedLectureIds)
    const changedTimes = new Set<string>()

    // Validate the final composition, allowing a conflicting item to be removed in the same batch.
    for (const [index, change] of changes.entries()) {
      match(change)
        .with({ kind: TimetableItemKind.LECTURE, op: 'add' }, ({ lectureId }) => {
          const lecture = addedLectures.find(({ id }) => id === lectureId)
          if (!lecture || lecture.year !== timetable.year || lecture.semester !== timetable.semester) {
            throw new BadRequestException('Lecture must exist in the timetable year and semester')
          }
          if (lectures.has(lecture.id)) throw new ConflictException('Lecture is already in timetable')
          lectures.set(lecture.id, lecture)
          changedTimes.add(`${TimetableItemKind.LECTURE}:${lecture.id}`)
        })
        .with({ kind: TimetableItemKind.LECTURE, op: 'remove' }, ({ id }) => {
          if (!lectures.delete(id)) throw new NotFoundException('No such lecture in timetable')
        })
        .with({ kind: TimetableItemKind.CUSTOM, op: 'add' }, ({ data }) => {
          const id = -index - 1
          const times = data.times ?? [{ day: data.day!, begin: data.begin!, end: data.end! }]
          blocks.set(id, {
            id, block_name: data.block_name, place: data.place, ...times[0], times,
          })
          changedTimes.add(`${TimetableItemKind.CUSTOM}:${id}`)
        })
        .with({ kind: TimetableItemKind.CUSTOM, op: 'remove' }, ({ id }) => {
          if (!blocks.delete(id)) throw new NotFoundException('No such custom block in timetable')
        })
        .with({ kind: TimetableItemKind.CUSTOM, op: 'update' }, ({ id, data }) => {
          const current = blocks.get(id)
          if (!current) throw new NotFoundException('No such custom block in timetable')
          const updated = ECustomblock.applyUpdate(current, data)
          validateCustomblockTimes(updated.times)
          blocks.set(id, updated)
          if (JSON.stringify(current.times) !== JSON.stringify(updated.times)) {
            changedTimes.add(`${TimetableItemKind.CUSTOM}:${id}`)
          }
        })
        .exhaustive()
    }
    const times = [
      ...[...lectures.values()].flatMap((lecture) => lecture.subject_classtime.map((time) => ({
        key: `${TimetableItemKind.LECTURE}:${lecture.id}`,
        day: time.day,
        begin: time.begin.getUTCHours() * 60 + time.begin.getUTCMinutes(),
        end: time.end.getUTCHours() * 60 + time.end.getUTCMinutes(),
      }))),
      ...[...blocks.values()].flatMap((block) => block.times.map((time) => ({ ...time, key: `${TimetableItemKind.CUSTOM}:${block.id}` }))),
    ]
    for (const time of times) {
      if (changedTimes.has(time.key) && times.some((other) => other.key !== time.key && ECustomblock.overlaps(time, other))) {
        throw new ConflictException('Timetable items overlap')
      }
    }

    const results: ITimetableV2.UpdateItemsResDto['results'] = []
    for (const [index, change] of changes.entries()) {
      const itemId = await match(change)
        .with({ kind: TimetableItemKind.LECTURE, op: 'add' }, async ({ lectureId }) => {
          await this.timetableRepository.addLectureToTimetable(timetableId, lectureId)
          return lectureId
        })
        .with({ kind: TimetableItemKind.LECTURE, op: 'remove' }, async ({ id }) => {
          await this.timetableRepository.removeLectureFromTimetable(timetableId, id)
          return id
        })
        .with({ kind: TimetableItemKind.CUSTOM, op: 'add' }, async ({ data }) => {
          const block = await this.customblockRepository.createCustomblock(data)
          await this.customblockRepository.addCustomblockToTimetable(timetableId, block.id)
          return block.id
        })
        .with({ kind: TimetableItemKind.CUSTOM, op: 'remove' }, async ({ id }) => {
          await this.customblockRepository.removeCustomblockFromTimetable(timetableId, id)
          return id
        })
        .with({ kind: TimetableItemKind.CUSTOM, op: 'update' }, async ({ id, data }) => {
          await this.customblockRepository.updateCustomblock(id, { ...data, times: blocks.get(id)!.times })
          return id
        })
        .exhaustive()
      results.push({ index, kind: change.kind, id: itemId })
    }
    const updated = await this.timetableRepository.getTimeTableWithItemsById(timetableId)
    return { timetableItems: toJsonTimetableV2WithItems(updated, language).timetableItems, results }
  }

  @Transactional()
  async getHomeTimetable(
    user: session_userprofile,
    query: ITimetableV2.HomeTimetableReqDto,
    language: Language,
  ): Promise<ITimetableV2.HomeTimetableResDto> {
    const { year, semester } = query
    const selection = await this.timetableRepository.getHomeTimetable(user.id, year, semester)
    if (selection?.timetable_id != null) {
      try {
        const timetable = await this.timetableRepository.getTimeTableWithItemsById(selection.timetable_id)
        if (timetable.user_id === user.id && timetable.year === year && timetable.semester === semester) {
          return {
            ...toJsonTimetableV2WithItems(timetable, language),
            source: 'saved',
            timetableId: timetable.id,
            name: timetable.name ?? '',
            year,
            semester,
          }
        }
      }
      catch (error) {
        if (!(error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025')) throw error
      }
    }
    return {
      ...await this.getMyTimetable(user, query, language),
      source: 'enrolled',
      timetableId: null,
      name: language === 'en' ? 'Enrolled timetable' : '실제 수강 시간표',
      year,
      semester,
    }
  }

  @Transactional()
  async setHomeTimetable(
    user: session_userprofile,
    body: ITimetableV2.SetHomeTimetableReqDto,
    language: Language,
  ): Promise<ITimetableV2.HomeTimetableResDto> {
    const { year, semester, timetableId } = body
    if (timetableId !== null) {
      await this.timetableRepository.lockTimetable(timetableId)
      const timetable = await this.TimetableValidation(user, timetableId)
      if (timetable.year !== year || timetable.semester !== semester) {
        throw new BadRequestException('Home timetable must be in the requested year and semester')
      }
    }
    await this.timetableRepository.setHomeTimetable(user.id, year, semester, timetableId)
    return this.getHomeTimetable(user, body, language)
  }

  private async publishLectureUpdates(lectureIds: number[]) {
    await Promise.all([...new Set(lectureIds)].map((id) => this.timetableMQ.publishLectureNumUpdate(id)))
      .catch((error) => logger.error('Failed to publish lecture num update', error))
  }

  private async TimetableValidation(user: session_userprofile, timetableId: number) {
    try {
      const timetable = await this.timetableRepository.getTimeTableBasicById(timetableId)
      if (timetable.user_id !== user.id) {
        throw new ForbiddenException('User is not owner of timetable')
      }
      return timetable
    }
    catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException('No such timetable')
      }
      throw error
    }
  }

  private async validateCustomblockTime(
    timetableId: number,
    candidates: ECustomblock.Time[],
    customblocks: ECustomblock.Basic[],
  ) {
    validateCustomblockTimes(candidates)

    const timetableLectures = await this.timetableRepository.getLecturesWithClassTimes(timetableId)
    const lectureTimes = timetableLectures
      .flatMap(({ subject_lecture }) => subject_lecture.subject_classtime)
      .map(({ day, begin, end }) => ({
        day,
        begin: begin.getUTCHours() * 60 + begin.getUTCMinutes(),
        end: end.getUTCHours() * 60 + end.getUTCMinutes(),
      }))
    const timetableEntries = [...customblocks.flatMap(ECustomblock.getTimes), ...lectureTimes]

    if (candidates.some((candidate) => timetableEntries.some((time) => ECustomblock.overlaps(candidate, time)))) {
      throw new ConflictException('Custom block overlaps an existing timetable entry')
    }
  }

  @Transactional()
  async addCustomblockToTimetable(timetableId: number, body: ICustomblock.CreateDto, user: session_userprofile) {
    await this.timetableRepository.lockTimetable(timetableId)
    await this.TimetableValidation(user, timetableId)
    const customblocks = await this.customblockRepository.getCustomblocksList(timetableId)
    parseCustomblockData(body, false)
    const times = body.times ?? [{ day: body.day!, begin: body.begin!, end: body.end! }]
    await this.validateCustomblockTime(timetableId, times, customblocks)
    const customBlock = await this.customblockRepository.createCustomblock({ ...body, times })
    // 시간표에 매핑 추가
    await this.customblockRepository.addCustomblockToTimetable(timetableId, customBlock.id)
    return customBlock
  }

  @Transactional()
  async getCustomblockList(timetableId: number, user: session_userprofile) {
    await this.TimetableValidation(user, timetableId)
    return this.customblockRepository.getCustomblocksList(timetableId)
  }

  @Transactional()
  async updateCustomblock(
    timetableId: number,
    customblockId: number,
    body: ICustomblock.UpdateDto,
    user: session_userprofile,
  ) {
    await this.timetableRepository.lockTimetable(timetableId)
    await this.TimetableValidation(user, timetableId)
    const customblocks = await this.customblockRepository.getCustomblocksList(timetableId)
    const current = customblocks.find((customblock) => customblock.id === customblockId)
    if (!current) {
      throw new NotFoundException('No such custom block in timetable')
    }
    parseCustomblockData(body, true)
    const updated = ECustomblock.applyUpdate(ECustomblock.normalize(current), body)
    await this.validateCustomblockTime(
      timetableId,
      updated.times,
      customblocks.filter((customblock) => customblock.id !== customblockId),
    )
    return this.customblockRepository.updateCustomblock(customblockId, { ...body, times: updated.times })
  }

  @Transactional()
  async removeCustomblockFromTimetable(timetableId: number, customblockId: number, user: session_userprofile) {
    await this.timetableRepository.lockTimetable(timetableId)
    await this.TimetableValidation(user, timetableId)
    await this.customblockRepository.removeCustomblockFromTimetable(timetableId, customblockId)
  }

  @Transactional()
  async getMyTimetable(
    user: session_userprofile,
    query: ITimetableV2.MyTimetableReqDto,
    language: Language,
  ): Promise<ITimetableV2.MyTimetableResDto> {
    const lectures = await this.lectureRepository.getTakenLecturesBySemester(user.id, query.year, query.semester)

    if (!lectures) {
      throw new BadRequestException('No timetable found for the current user')
    }

    const serialized = toJsonLectures(lectures, language).lectures
    return { lectures: serialized, timetableItems: serialized.map((data) => ({ kind: TimetableItemKind.LECTURE, data })) }
  }
}
