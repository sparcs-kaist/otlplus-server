import { readFileSync } from 'fs'
import path from 'path'

it.each(['docs', 'src'])('documents split timetable contents and preserves mixed PATCH items in %s/swagger.json', (directory) => {
  const document = JSON.parse(readFileSync(path.join(__dirname, '..', directory, 'swagger.json'), 'utf8'))
  const schemas = document.components.schemas
  for (const name of ['TimetableDetailResDto', 'MyTimetableResDto', 'HomeTimetableResDto', 'SharedTimetableResDto']) {
    const schema = schemas[`ITimetableV2.${name}`]
    expect(schema.properties.lectures.items.$ref).toBe('#/components/schemas/ITimetableV2.LectureResDto')
    expect(schema.properties.customBlocks.items.$ref).toBe('#/components/schemas/ICustomblock.Basic')
    expect(schema.required).toEqual(expect.arrayContaining(['lectures', 'customBlocks']))
    expect(schema.properties).not.toHaveProperty('timetableItems')
  }
  const metadataFields = ['timetableType', 'timetableId', 'name', 'year', 'semester'].sort()
  const selectionResponse = schemas['ITimetableV2.TimetableSelectionResDto']
  expect(Object.keys(selectionResponse.properties).sort()).toEqual(metadataFields)
  expect([...selectionResponse.required].sort()).toEqual(metadataFields)
  for (const name of ['HomeTimetableResDto', 'SharedTimetableResDto', 'TimetableSelectionResDto']) {
    const schema = schemas[`ITimetableV2.${name}`]
    expect(schema.required).toContain('timetableType')
    expect(schema.properties.timetableType).toMatchObject({ type: 'string', enum: ['scholar', 'timetable'] })
    expect(schema.properties).not.toHaveProperty('source')
  }
  expect(selectionResponse.properties.timetableId.oneOf).toEqual([{ type: 'number' }, { type: 'null' }])
  expect(schemas).not.toHaveProperty('ITimetableV2.SetSharedTimetableResDto')
  expect(schemas['ITimetableV2.UpdateItemsResDtoV1'].properties.timetableItems.items.$ref)
    .toBe('#/components/schemas/ITimetableV2.TimetableItem')
  expect(Object.keys(schemas['ITimetableV2.UpdateItemsResDtoV1'].properties)).toEqual(['timetableItems', 'results'])
  expect(schemas['ITimetableV2.UpdateItemsReqDtoV1'].properties.changes.items.$ref)
    .toBe('#/components/schemas/ITimetableV2.TimetableChange')
  expect(schemas['ITimetableV2.TimetableItem'].anyOf).toHaveLength(2)
  expect(schemas['ITimetableV2.TimetableItem'].anyOf.map((item: any) => item.properties.kind.const))
    .toEqual(['lecture', 'custom'])
  expect(schemas['ICustomblock.Basic'].required).toContain('times')
  expect(schemas['ICustomblock.Basic'].properties.times.items.$ref).toBe('#/components/schemas/ICustomblock.Time')
  expect(schemas['ICustomblock.CreateDto'].properties).toHaveProperty('times')
  expect(schemas['ICustomblock.UpdateDto'].properties).toHaveProperty('times')
  expect(schemas.TimetableItemKind).toEqual({ type: 'string', enum: ['lecture', 'custom'] })
  expect(schemas['ITimetableV2.TimetableChange'].anyOf).toHaveLength(4)
  expect(schemas['ITimetableV2.UpdateItemsResDtoV1'].properties.results.items.properties.kind.$ref)
    .toBe('#/components/schemas/TimetableItemKind')
  const selection = schemas['ITimetableV2.SetHomeTimetableReqDto']
  expect(selection.required).toContain('timetableId')
  expect(selection.properties.timetableId).toEqual({ type: 'integer', minimum: 1 })
  expect(schemas['ITimetableV2.SetSharedTimetableReqDto'].properties.timetableId.anyOf).toContainEqual({ type: 'null' })
  expect(document.paths['/api/v2/timetables/home']).toHaveProperty('patch')
  expect(document.paths['/api/v2/timetables/home'].patch.parameters ?? [])
    .not.toContainEqual(expect.objectContaining({ in: 'header', name: 'accept-language' }))
  expect(document.paths['/api/v2/timetables/shared']).toHaveProperty('get')
  expect(document.paths['/api/v2/timetables/shared']).toHaveProperty('patch')
  expect(schemas['ITimetableV2.SharedTimetableResDto'].required).toContain('timetableId')
  expect(document.paths['/api/v2/timetables/{timetableId}/items']).toHaveProperty('patch')
  for (const [endpoint, method, dto] of [
    ['/api/v2/timetables/{timetableId}', 'get', 'TimetableDetailResDto'],
    ['/api/v2/timetables/{timetableId}/items', 'get', 'TimetableDetailResDto'],
    ['/api/v2/timetables/my-timetable', 'get', 'MyTimetableResDto'],
    ['/api/v2/timetables/home', 'get', 'HomeTimetableResDto'],
    ['/api/v2/timetables/home', 'patch', 'TimetableSelectionResDto'],
    ['/api/v2/timetables/shared', 'get', 'SharedTimetableResDto'],
    ['/api/v2/timetables/shared', 'patch', 'TimetableSelectionResDto'],
    ['/api/v2/friends/{friendId}/timetables/shared', 'get', 'SharedTimetableResDto'],
  ]) {
    expect(document.paths[endpoint][method].responses['200'].content['application/json'].schema.$ref)
      .toBe(`#/components/schemas/ITimetableV2.${dto}`)
  }
})

it.each(['docs', 'src'])('documents only shared friend timetable reads and two overlap groups in %s/swagger.json', (directory) => {
  const document = JSON.parse(readFileSync(path.join(__dirname, '..', directory, 'swagger.json'), 'utf8'))
  const paths = document.paths
  const schemas = document.components.schemas
  const response = (path: string) => paths[path].get.responses['200'].content['application/json'].schema.$ref
  expect(paths['/api/v2/friends/code']).not.toHaveProperty('post')
  expect(paths['/api/v2/friends/code'].put.responses['200'].content['application/json'].schema.$ref)
    .toBe('#/components/schemas/IFriendV2.GetCodeResDto')
  expect(response('/api/v2/friends/code')).toBe('#/components/schemas/IFriendV2.GetCodeResDto')
  expect(response('/api/v2/friends/{friendId}/timetables/shared'))
    .toBe('#/components/schemas/ITimetableV2.SharedTimetableResDto')
  for (const prefix of ['/api/v2/timetables', '/api/v2/friends/{friendId}/timetables']) {
    expect(response(`${prefix}/shared/semesters`)).toBe('#/components/schemas/ITimetableV2.SharedTimetableSemestersResDto')
  }
  expect(schemas['ITimetableV2.OwnTimetableSummary'].required).toEqual(expect.arrayContaining(['isMain', 'isShared']))
  expect(schemas['ITimetableV2.TimetableSummary'].properties).not.toHaveProperty('isMain')
  for (const suffix of ['', '/my-timetable', '/{timetableId}']) {
    expect(paths).not.toHaveProperty(`/api/v2/friends/{friendId}/timetables${suffix}`)
  }
  expect(schemas).not.toHaveProperty('IFriendV2.GetTimetablesResDto')
  expect(response('/api/v2/friends/lectures/{lectureId}/overlaps')).toBe('#/components/schemas/IFriendV2.GetOverlapsResDto')
  expect(Object.keys(schemas['IFriendV2.GetOverlapsResDto'].properties)).toEqual(['sameLecture', 'sameCourseOtherSemester'])
  expect(schemas['IFriendV2.GetOverlapsResDto'].required).toEqual(['sameLecture', 'sameCourseOtherSemester'])
  expect(schemas['IFriendV2.FriendListItem'].required).toContain('hasScheduleNow')
})

it.each(['docs', 'src'])('documents both PATCH /items contracts in %s/swagger.json', (directory) => {
  const document = JSON.parse(readFileSync(path.join(__dirname, '..', directory, 'swagger.json'), 'utf8'))
  const schemas = document.components.schemas
  const endpoint = document.paths['/api/v2/timetables/{timetableId}/items']
  expect(Object.keys(endpoint).sort()).toEqual(['get', 'patch'])
  const { patch } = endpoint
  expect(patch.requestBody.content['application/json'].schema).toEqual({
    oneOf: ['UpdateItemsReqDtoV1', 'UpdateItemsReqDtoV2'].map((name) => ({ $ref: `#/components/schemas/ITimetableV2.${name}` })),
  })
  expect(patch.responses['200'].content['application/json'].schema).toEqual({
    oneOf: ['UpdateItemsResDtoV1', 'UpdateItemsResDtoV2'].map((name) => ({ $ref: `#/components/schemas/ITimetableV2.${name}` })),
  })

  const legacy = schemas['ITimetableV2.UpdateItemsReqDtoV1']
  expect(Object.keys(legacy.properties)).toEqual(['changes'])
  expect(legacy.required).toEqual(['changes'])
  expect(legacy.additionalProperties).toBe(false)
  expect(legacy.properties.changes.minItems).toBe(1)

  const grouped = schemas['ITimetableV2.UpdateItemsReqDtoV2']
  expect(Object.keys(grouped.properties)).toEqual(['adds', 'deletes', 'updates'])
  expect(grouped.required).toEqual(['adds', 'deletes', 'updates'])
  expect(grouped.additionalProperties).toBe(false)
  for (const [field, name, blockDto, hasLectures] of [
    ['adds', 'AddItemsDto', 'AddCustomBlockDto', true],
    ['deletes', 'DeleteItemsDto', 'UpdateCustomBlockDto', true],
    ['updates', 'UpdateItemsDto', 'UpdateCustomBlockDto', false],
  ] as const) {
    const group = schemas[`ITimetableV2.${name}`]
    const fields = hasLectures ? ['customBlocks', 'lectures'] : ['customBlocks']
    expect(grouped.properties[field].$ref).toBe(`#/components/schemas/ITimetableV2.${name}`)
    expect(Object.keys(group.properties).sort()).toEqual(fields)
    expect([...group.required].sort()).toEqual(fields)
    expect(group.additionalProperties).toBe(false)
    expect(group.properties.customBlocks.items.$ref).toBe(`#/components/schemas/ITimetableV2.${blockDto}`)
    if (hasLectures) {
      expect(group.properties.lectures.items.$ref).toBe('#/components/schemas/ITimetableV2.TimetableLectureRef')
    }
  }

  const response = schemas['ITimetableV2.UpdateItemsResDtoV2']
  expect(Object.keys(response.properties).sort()).toEqual(['customBlocks', 'lectures'])
  expect([...response.required].sort()).toEqual(['customBlocks', 'lectures'])
  expect(response.properties.lectures.items.$ref).toBe('#/components/schemas/ITimetableV2.LectureResDto')
  expect(response.properties.customBlocks.items.$ref).toBe('#/components/schemas/ICustomblock.Basic')
})
