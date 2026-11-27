import 'reflect-metadata'

import { BadRequestException, ValidationPipe } from '@nestjs/common'
import { ICustomblock } from '@otl/server-nest/common/interfaces/ICustomblock'
import { ITimetableV2 } from '@otl/server-nest/common/interfaces/v2'

import {
  parseTimetableChanges, parseTimetableItemUpdate, parseTimetableItemUpdateForBuddyMigration, validateCreateTimetableInput,
} from './timetable-input'

const block = { block_name: 'Study', place: '', day: 0, begin: 600, end: 660 }
const pipe = new ValidationPipe({ transform: true, whitelist: true })

describe('Timetable item request validation', () => {
  it('preserves a one-item or mixed array through the production validation pipe', async () => {
    for (const changes of [
      [{ op: 'add', kind: 'lecture', lectureId: 1 }],
      [{ op: 'remove', kind: 'lecture', id: 1 }, { op: 'add', kind: 'custom', data: block }],
    ]) {
      const body = await pipe.transform({ changes }, { type: 'body', metatype: ITimetableV2.UpdateItemsReqDtoV1 })
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

  it('retains optional creation fields and allows academic selection only for sharing through the validation pipe', async () => {
    const term = { year: 2026, semester: 3 }
    for (const body of [{ ...term, lectureIds: [] }, { ...term, sourceTimetableId: 1 }]) {
      const parsed = await pipe.transform(body, { type: 'body', metatype: ITimetableV2.CreateReqDto })
      expect(parsed).toEqual(body)
      expect(() => validateCreateTimetableInput(parsed)).not.toThrow()
    }
    const deselection = { ...term, timetableId: null }
    await expect(pipe.transform(deselection, { type: 'body', metatype: ITimetableV2.SetSharedTimetableReqDto }))
      .resolves.toEqual(deselection)
    for (const body of [deselection, term, { ...term, timetableId: '1' }, { ...term, timetableId: 0 }]) {
      await expect(pipe.transform(body, { type: 'body', metatype: ITimetableV2.SetHomeTimetableReqDto }))
        .rejects.toThrow(BadRequestException)
    }
  })
})

describe('versioned timetable item updates', () => {
  it('preserves V1 changes and ignores unrelated top-level fields as the old whitelist did', () => {
    const changes = [{ op: 'remove', kind: 'lecture', id: 1 }, { op: 'add', kind: 'custom', data: block }]
    expect(parseTimetableItemUpdateForBuddyMigration({ changes })).toEqual(changes)
    expect(parseTimetableItemUpdateForBuddyMigration({ changes, unrelated: true })).toEqual(changes)
  })

  const empty = {
    adds: { lectures: [], customBlocks: [] },
    deletes: { lectures: [], customBlocks: [] },
    updates: { customBlocks: [] },
  }

  it.each([
    undefined, null, [], {},
    { changes: [] }, { changes: null },
    { customBlocks: [{ id: 11, place: 'Library' }] },
    ...Object.entries(empty).map(([group, operations]) => ({
      changes: [{ op: 'remove', kind: 'lecture', id: 1 }], [group]: operations,
    })),
  ].map((body) => [body]))('rejects malformed or mixed requests in the V1 parser: %j', (body) => {
    expect(() => parseTimetableItemUpdateForBuddyMigration(body)).toThrow(BadRequestException)
  })

  it('converts V2 operations in delete, update, add order without modifying the request', () => {
    const times = [{ day: 0, begin: 600, end: 660 }, { day: 2, begin: 600, end: 660 }]
    const body = {
      adds: { lectures: [{ id: 9, name: 'Lecture' }], customBlocks: [{ id: 99, ...block, times }] },
      deletes: { lectures: [{ id: 1, name: 'Removed lecture' }], customBlocks: [{ id: 1, ...block, times }] },
      updates: { customBlocks: [{ id: 12, place: '' }, { id: 11, ...block, times }] },
    }
    const before = structuredClone(body)
    expect(parseTimetableItemUpdate(body)).toEqual([
      { op: 'remove', kind: 'lecture', id: 1 },
      { op: 'remove', kind: 'custom', id: 1 },
      { op: 'update', kind: 'custom', id: 12, data: { place: '' } },
      { op: 'update', kind: 'custom', id: 11, data: { ...block, times } },
      { op: 'add', kind: 'lecture', lectureId: 9 },
      { op: 'add', kind: 'custom', data: { ...block, times } },
    ])
    expect(body).toEqual(before)
  })

  it.each([
    undefined, null, [], {}, empty,
    { customBlocks: [{ id: 11, place: 'Library' }] },
    { ...empty, changes: [{ op: 'remove', kind: 'lecture', id: 1 }] },
    { ...empty, extra: true },
    { ...empty, adds: null },
    { ...empty, adds: { customBlocks: [block] } },
    { ...empty, adds: { lectures: [{ id: 1 }], customBlocks: [], extra: true } },
    { ...empty, deletes: { lectures: [{ id: 1 }], customBlocks: null } },
    { ...empty, updates: { customBlocks: [], lectures: [{ id: 1 }] } },
    { ...empty, adds: { lectures: [{ id: 1 }], customBlocks: [{ ...block, op: 'add' }] } },
    { ...empty, adds: { lectures: [{ id: 1 }], customBlocks: [{ ...block, times: [] }] } },
    { ...empty, adds: { lectures: [{ id: 1 }], customBlocks: [] }, deletes: { lectures: [{ id: 1 }], customBlocks: [] } },
    { ...empty, deletes: { lectures: [], customBlocks: [{ id: 11 }] }, updates: { customBlocks: [{ id: 11, place: '' }] } },
    ...[null, [], 1, {}, { id: 0 }, { id: '11' }, { id: 2147483648 }].flatMap((invalid) => [
      { ...empty, adds: { lectures: [invalid], customBlocks: [] } },
      { ...empty, deletes: { lectures: [invalid], customBlocks: [] } },
      { ...empty, deletes: { lectures: [], customBlocks: [invalid] } },
    ]),
    ...[
      null, { place: 'Library' }, { id: 0, place: 'Library' }, { id: -1, place: 'Library' },
      { id: 1.5, place: 'Library' }, { id: '11', place: 'Library' }, { id: 11 },
      { id: 11, place: 'Library', extra: true }, { id: 11, block_name: ' ' },
      { id: 11, place: null }, { id: 11, day: 7 }, { id: 11, times: [] },
    ].map((invalid) => ({ ...empty, updates: { customBlocks: [invalid] } })),
  ].map((body) => [body]))('rejects ambiguous or malformed V2 updates: %j', (body) => {
    expect(() => parseTimetableItemUpdate(body)).toThrow(BadRequestException)
  })
})

describe('custom block time arrays', () => {
  const first = { day: 0, begin: 600, end: 660 }
  const data = { block_name: 'Study', place: '', times: [first, { day: 2, begin: 600, end: 660 }] }

  it.each([data, { ...data, ...first }])('accepts arrays with optional matching legacy fields', (data) => {
    const changes = [{ op: 'add', kind: 'custom', data }]
    expect(parseTimetableChanges(changes)).toEqual(changes)
  })

  it('keeps nested times through the legacy endpoint validation pipe', async () => {
    expect(await pipe.transform(data, { type: 'body', metatype: ICustomblock.CreateDto })).toEqual(data)
    expect(await pipe.transform({ times: data.times }, { type: 'body', metatype: ICustomblock.UpdateDto }))
      .toEqual({ times: data.times })
  })

  it.each([
    [], null, {}, [null],
    [first, first], [first, { ...first, begin: 630 }],
    [{ ...first, day: 7 }], [{ ...first, begin: -1 }], [{ ...first, end: 1441 }],
    [{ ...first, end: first.begin }], [{ ...first, day: '0' }],
    [{ day: 0, begin: 600 }], [{ ...first, extra: true }],
  ].map((times) => [times]))('rejects malformed or overlapping time arrays: %j', (times) => {
    expect(() => parseTimetableChanges([{ op: 'add', kind: 'custom', data: { ...data, times } }]))
      .toThrow(BadRequestException)
  })

  it('rejects inconsistent mirrors and accepts adjacent slots', () => {
    expect(() => parseTimetableChanges([{ op: 'add', kind: 'custom', data: { ...data, day: 3 } }]))
      .toThrow(BadRequestException)
    expect(() => parseTimetableChanges([{ op: 'add', kind: 'custom', data: {
      ...data, times: [first, { ...first, begin: 660, end: 720 }],
    } }])).not.toThrow()
  })
})
