import 'reflect-metadata'

import { BadRequestException, ValidationPipe } from '@nestjs/common'
import { ITimetableV2 } from '@otl/server-nest/common/interfaces/v2'

import { parseTimetableChanges, validateCreateTimetableInput } from './timetable-input'

const block = { block_name: 'Study', place: '', day: 0, begin: 600, end: 660 }
const pipe = new ValidationPipe({ transform: true, whitelist: true })

describe('Timetable item request validation', () => {
  it('preserves a one-item or mixed array through the production validation pipe', async () => {
    for (const changes of [
      [{ op: 'add', kind: 'lecture', lectureId: 1 }],
      [{ op: 'remove', kind: 'lecture', id: 1 }, { op: 'add', kind: 'custom', data: block }],
    ]) {
      const body = await pipe.transform({ changes }, { type: 'body', metatype: ITimetableV2.UpdateItemsReqDto })
      expect(parseTimetableChanges(body.changes)).toEqual(changes)
    }
  })

  it.each([
    undefined,
    null,
    [],
    { op: 'remove', kind: 'lecture', id: 1 },
    [null],
    [{ op: 'add', kind: 'event', lectureId: 1 }],
    [{ op: 'update', kind: 'lecture', id: 1, data: {} }],
    [{ op: 'add', kind: 'lecture', lectureId: '1' }],
    [{ op: 'remove', kind: 'custom', id: -1 }],
    [{ op: 'remove', kind: 'custom', id: 1.5 }],
    [{ op: 'add', kind: 'lecture', lectureId: 1, data: { classes: [] } }],
    [{ op: 'add', kind: 'custom', data: { ...block, day: 7 } }],
    [{ op: 'add', kind: 'custom', data: { ...block, begin: -1 } }],
    [{ op: 'add', kind: 'custom', data: { ...block, end: 1441 } }],
    [{ op: 'add', kind: 'custom', data: { ...block, end: block.begin } }],
    [{ op: 'add', kind: 'custom', data: { ...block, block_name: ' ' } }],
    [{ op: 'add', kind: 'custom', data: { ...block, place: null } }],
    [{ op: 'add', kind: 'custom', data: { ...block, block_name: 'x'.repeat(256) } }],
    [{ op: 'add', kind: 'custom', data: { block_name: 'Study' } }],
    [{ op: 'update', kind: 'custom', id: 1, data: {} }],
    [{ op: 'update', kind: 'custom', id: 1, data: { begin: '600' } }],
    [{ op: 'remove', kind: 'lecture', id: 1 }, { op: 'add', kind: 'lecture', lectureId: 1 }],
    [{ op: 'update', kind: 'custom', id: 1, data: { place: 'Library' } }, { op: 'remove', kind: 'custom', id: 1 }],
  ].map((changes) => [changes]))('rejects malformed or contradictory changes: %j', (changes) => {
    expect(() => parseTimetableChanges(changes)).toThrow(BadRequestException)
  })

  it('distinguishes lecture and custom IDs and supports partial edits and day boundaries', () => {
    const changes = [
      { op: 'remove', kind: 'lecture', id: 1 },
      { op: 'update', kind: 'custom', id: 1, data: { place: '' } },
      { op: 'add', kind: 'custom', data: { ...block, day: 6, begin: 0, end: 1440 } },
    ]
    expect(parseTimetableChanges(changes)).toEqual(changes)
  })

  it('accepts legacy empty creation and source cloning, rejecting ambiguous creation', () => {
    const term = { year: 2026, semester: 3 }
    expect(() => validateCreateTimetableInput({ ...term, lectureIds: [] })).not.toThrow()
    expect(() => validateCreateTimetableInput({ ...term, lectureIds: [1, 1] })).not.toThrow()
    expect(() => validateCreateTimetableInput({ ...term, sourceTimetableId: 1 })).not.toThrow()
    expect(() => validateCreateTimetableInput(term)).toThrow(BadRequestException)
    expect(() => validateCreateTimetableInput({ ...term, lectureIds: [], sourceTimetableId: 1 }))
      .toThrow(BadRequestException)
  })

  it('retains optional creation fields and explicit home deselection through the validation pipe', async () => {
    const term = { year: 2026, semester: 3 }
    for (const body of [{ ...term, lectureIds: [] }, { ...term, sourceTimetableId: 1 }]) {
      const parsed = await pipe.transform(body, { type: 'body', metatype: ITimetableV2.CreateReqDto })
      expect(parsed).toEqual(body)
      expect(() => validateCreateTimetableInput(parsed)).not.toThrow()
    }
    const deselection = { ...term, timetableId: null }
    await expect(pipe.transform(deselection, { type: 'body', metatype: ITimetableV2.SetHomeTimetableReqDto }))
      .resolves.toEqual(deselection)
    for (const body of [term, { ...term, timetableId: '1' }, { ...term, timetableId: 0 }]) {
      await expect(pipe.transform(body, { type: 'body', metatype: ITimetableV2.SetHomeTimetableReqDto }))
        .rejects.toThrow(BadRequestException)
    }
  })
})
