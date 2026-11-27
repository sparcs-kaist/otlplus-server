import 'reflect-metadata'

import { BadRequestException, ValidationPipe } from '@nestjs/common'
import { ICustomblock } from '@otl/server-nest/common/interfaces/ICustomblock'
import { ITimetableV2 } from '@otl/server-nest/common/interfaces/v2'

import {
  parseTimetableChanges, parseTimetableItems, parseTimetableItemUpdate, parseTimetableItemUpdateForBuddyMigration, validateCreateTimetableInput,
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

  it.each([
    undefined, null, [], {},
    { changes: [] }, { changes: null },
    { customBlocks: [{ id: 11, place: 'Library' }] },
    { changes: [{ op: 'remove', kind: 'lecture', id: 1 }], customBlocks: [] },
    { changes: [{ op: 'remove', kind: 'lecture', id: 1 }], customBlocks: [{ id: 11, place: 'Library' }] },
  ].map((body) => [body]))('rejects malformed or mixed requests in the V1 parser: %j', (body) => {
    expect(() => parseTimetableItemUpdateForBuddyMigration(body)).toThrow(BadRequestException)
  })

  it('converts V2 partial and full custom-block updates in request order without changing the input', () => {
    const times = [{ day: 0, begin: 600, end: 660 }, { day: 2, begin: 600, end: 660 }]
    const body = { customBlocks: [{ id: 12, place: '' }, { id: 11, ...block, times }] }
    expect(parseTimetableItemUpdate(body)).toEqual([
      { op: 'update', kind: 'custom', id: 12, data: { place: '' } },
      { op: 'update', kind: 'custom', id: 11, data: { ...block, times } },
    ])
    expect(body).toEqual({ customBlocks: [{ id: 12, place: '' }, { id: 11, ...block, times }] })
  })

  it.each([
    undefined, null, [], {},
    { changes: [] }, { changes: null },
    { changes: [{ op: 'remove', kind: 'lecture', id: 1 }] },
    { changes: [{ op: 'remove', kind: 'lecture', id: 1 }], customBlocks: [] },
    { changes: [], customBlocks: [{ id: 11, place: 'Library' }] },
    { changes: null, customBlocks: [{ id: 11, place: 'Library' }] },
    { customBlocks: [] }, { customBlocks: null }, { customBlocks: {} }, { customBlocks: [null] },
    { customBlocks: [{ place: 'Library' }] },
    { customBlocks: [{ id: 0, place: 'Library' }] },
    { customBlocks: [{ id: -1, place: 'Library' }] },
    { customBlocks: [{ id: 1.5, place: 'Library' }] },
    { customBlocks: [{ id: '11', place: 'Library' }] },
    { customBlocks: [{ id: 2147483648, place: 'Library' }] },
    { customBlocks: [{ id: 11 }] },
    { customBlocks: [{ id: 11, place: 'Library' }, { id: 11, block_name: 'Duplicate' }] },
    { customBlocks: [{ id: 11, place: 'Library' }], extra: true },
    { customBlocks: [{ id: 11, place: 'Library', extra: true }] },
    { customBlocks: [{ id: 11, op: 'update', place: 'Library' }] },
    { customBlocks: [{ id: 11, kind: 'custom', data: { place: 'Library' } }] },
    { customBlocks: [{ id: 11, block_name: ' ' }] },
    { customBlocks: [{ id: 11, place: null }] },
    { customBlocks: [{ id: 11, day: 7 }] },
    { customBlocks: [{ id: 11, begin: '600' }] },
    { customBlocks: [{ id: 11, begin: 600, end: 600 }] },
    { customBlocks: [{ id: 11, times: [] }] },
  ].map((body) => [body]))('rejects ambiguous or malformed V2 updates: %j', (body) => {
    expect(() => parseTimetableItemUpdate(body)).toThrow(BadRequestException)
  })
})

describe('method-specific timetable items', () => {
  it('builds changes from separate lecture and custom block groups and retains grouped times', () => {
    const data = { block_name: 'Study', place: '', times: [{ day: 1, begin: 600, end: 660 }] }
    expect(parseTimetableItems({ lectureIds: [1], customBlocks: [data] }, 'add')).toEqual([
      { op: 'add', kind: 'lecture', lectureId: 1 }, { op: 'add', kind: 'custom', data },
    ])
    expect(parseTimetableItems({ lectureIds: [1], customBlockIds: [1] }, 'remove')).toEqual([
      { op: 'remove', kind: 'lecture', id: 1 }, { op: 'remove', kind: 'custom', id: 1 },
    ])
  })

  it('accepts a single populated group with the other group omitted or empty', () => {
    for (const op of ['add', 'remove'] as const) {
      const customField = op === 'add' ? 'customBlocks' : 'customBlockIds'
      const customItems = op === 'add' ? [block] : [1]
      for (const body of [
        { lectureIds: [1] }, { lectureIds: [1], [customField]: [] },
        { [customField]: customItems }, { lectureIds: [], [customField]: customItems },
      ]) {
        expect(parseTimetableItems(body, op)).toHaveLength(1)
      }
    }
  })

  it.each([
    undefined, null, [], {},
    { lectureIds: null }, { lectureIds: [] }, { lectureIds: {} }, { lectureIds: [null] },
    { lectureIds: ['1'] }, { lectureIds: [0] }, { lectureIds: [1, 1] },
    { lectureIds: [1], extra: true }, { lectureIds: [1], op: 'add' },
    { lectureIds: [1], kind: 'lecture' }, { items: [{ kind: 'lecture', lectureId: 1 }] },
  ].map((body) => [body]))('rejects invalid grouped requests: %j', (body) => {
    for (const op of ['add', 'remove'] as const) {
      expect(() => parseTimetableItems(body, op)).toThrow(BadRequestException)
    }
  })

  it.each(['add', 'remove'] as const)('rejects invalid custom groups on %s', (operation) => {
    const customField = operation === 'add' ? 'customBlocks' : 'customBlockIds'
    for (const value of [null, {}, [null], [1.5], ['1']]) {
      expect(() => parseTimetableItems({ lectureIds: [1], [customField]: value }, operation)).toThrow(BadRequestException)
    }
    expect(() => parseTimetableItems({ lectureIds: [], [customField]: [] }, operation)).toThrow(BadRequestException)
    const wrongField = operation === 'add' ? 'customBlockIds' : 'customBlocks'
    expect(() => parseTimetableItems({ lectureIds: [1], [wrongField]: [] }, operation)).toThrow(BadRequestException)
    expect(() => parseTimetableItems({ customBlockIds: [1, 1] }, 'remove')).toThrow(BadRequestException)
  })

  it('validates custom data directly without accepting item wrappers or client operations', () => {
    for (const data of [{ ...block, day: 7 }, { ...block, op: 'add' }, { kind: 'custom', data: block }]) {
      expect(() => parseTimetableItems({ customBlocks: [data] }, 'add')).toThrow(BadRequestException)
    }
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
