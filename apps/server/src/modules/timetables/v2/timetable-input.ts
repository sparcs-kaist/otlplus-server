import { BadRequestException } from '@nestjs/common'
import { ICustomblock } from '@otl/server-nest/common/interfaces/ICustomblock'
import { ITimetableV2 } from '@otl/server-nest/common/interfaces/v2'

import { TimetableItemKind } from '@otl/common/enum/timetable'

const fail = (message: string): never => {
  throw new BadRequestException(message)
}

function object(value: unknown): Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return fail('Each change and its data must be an object')
  }
  return value as Record<string, unknown>
}

function keys(value: Record<string, unknown>, allowed: string[]) {
  if (Object.keys(value).some((key) => !allowed.includes(key))) {
    fail('Unexpected timetable change field')
  }
}

function integer(value: unknown, min: number, max: number): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= min && value <= max
}

function id(value: unknown): number {
  if (!integer(value, 1, 2147483647)) return fail('Item IDs must be positive integers')
  return value
}

function customData(value: unknown, partial: boolean): ICustomblock.CreateDto | ICustomblock.UpdateDto {
  const data = object(value)
  const fields = ['block_name', 'place', 'day', 'begin', 'end']
  keys(data, fields)
  if (Object.keys(data).length === 0 || (!partial && fields.some((field) => !(field in data)))) {
    fail('Custom block data is incomplete')
  }
  if ('block_name' in data && (typeof data.block_name !== 'string'
    || data.block_name.trim().length === 0 || data.block_name.length > 255)) {
    fail('Custom block name must contain 1 to 255 characters')
  }
  if ('place' in data && (typeof data.place !== 'string' || data.place.length > 255)) {
    fail('Custom block place must be a string of at most 255 characters')
  }
  if ('day' in data && !integer(data.day, 0, 6)) fail('Custom block day must be between 0 and 6')
  if ('begin' in data && !integer(data.begin, 0, 1439)) fail('Custom block begin must be between 0 and 1439')
  if ('end' in data && !integer(data.end, 1, 1440)) fail('Custom block end must be between 1 and 1440')
  if (typeof data.begin === 'number' && typeof data.end === 'number' && data.begin >= data.end) {
    fail('Custom block begin must precede its end')
  }
  return data as unknown as ICustomblock.CreateDto | ICustomblock.UpdateDto
}

export function parseTimetableChanges(input: unknown): ITimetableV2.TimetableChange[] {
  if (!Array.isArray(input) || input.length === 0) return fail('changes must be a non-empty array')
  const seen = new Set<string>()
  return input.map((value) => {
    const change = object(value)
    if (change.kind !== TimetableItemKind.LECTURE && change.kind !== TimetableItemKind.CUSTOM) fail('Unsupported timetable item kind')
    let parsed: ITimetableV2.TimetableChange
    let itemId: number | undefined
    if (change.op === 'add' && change.kind === TimetableItemKind.LECTURE) {
      keys(change, ['op', 'kind', 'lectureId'])
      itemId = id(change.lectureId)
      parsed = { op: 'add', kind: TimetableItemKind.LECTURE, lectureId: itemId }
    }
    else if (change.op === 'add' && change.kind === TimetableItemKind.CUSTOM) {
      keys(change, ['op', 'kind', 'data'])
      parsed = { op: 'add', kind: TimetableItemKind.CUSTOM, data: customData(change.data, false) as ICustomblock.CreateDto }
    }
    else if (change.op === 'remove' && (change.kind === TimetableItemKind.LECTURE || change.kind === TimetableItemKind.CUSTOM)) {
      keys(change, ['op', 'kind', 'id'])
      itemId = id(change.id)
      parsed = { op: 'remove', kind: change.kind, id: itemId }
    }
    else if (change.op === 'update' && change.kind === TimetableItemKind.CUSTOM) {
      keys(change, ['op', 'kind', 'id', 'data'])
      itemId = id(change.id)
      parsed = {
        op: 'update', kind: TimetableItemKind.CUSTOM, id: itemId, data: customData(change.data, true),
      }
    }
    else {
      return fail('Unsupported timetable item operation')
    }
    if (itemId !== undefined) {
      const key = `${change.kind}:${itemId}`
      if (seen.has(key)) fail('An item may only be changed once per request')
      seen.add(key)
    }
    return parsed
  })
}

export function validateCreateTimetableInput(body: ITimetableV2.CreateReqDto): void {
  const hasLectures = body.lectureIds !== undefined
  const hasSource = body.sourceTimetableId !== undefined
  if (hasLectures === hasSource) fail('Provide exactly one of lectureIds and sourceTimetableId')
  if (hasSource) id(body.sourceTimetableId)
  if (hasLectures) {
    if (!Array.isArray(body.lectureIds)) fail('lectureIds must be an array')
    body.lectureIds!.forEach(id)
  }
}
