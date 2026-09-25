import { readFileSync } from 'fs'
import path from 'path'

it('documents unified items, change variants and required nullable home selection', () => {
  const document = JSON.parse(readFileSync(path.join(__dirname, 'swagger.json'), 'utf8'))
  const schemas = document.components.schemas
  for (const name of ['TimetableDetailResDto', 'HomeTimetableResDto', 'UpdateItemsResDto']) {
    expect(schemas[`ITimetableV2.${name}`].properties.timetableItems.items.$ref)
      .toBe('#/components/schemas/ITimetableV2.TimetableItem')
  }
  expect(schemas['ITimetableV2.UpdateItemsReqDto'].properties.changes.items.$ref)
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
  expect(schemas['ITimetableV2.UpdateItemsResDto'].properties.results.items.properties.kind.$ref)
    .toBe('#/components/schemas/TimetableItemKind')
  const selection = schemas['ITimetableV2.SetHomeTimetableReqDto']
  expect(selection.required).toContain('timetableId')
  expect(selection.properties.timetableId.anyOf).toContainEqual({ type: 'null' })
  expect(document.paths['/api/v2/timetables/home']).toHaveProperty('patch')
  expect(document.paths['/api/v2/timetables/{timetableId}/items']).toHaveProperty('patch')
})

it('documents the same unified item contract for authorized friend timetables', () => {
  const document = JSON.parse(readFileSync(path.join(__dirname, 'swagger.json'), 'utf8'))
  const paths = document.paths
  const schemas = document.components.schemas
  const response = (path: string) => paths[path].get.responses['200'].content['application/json'].schema.$ref
  expect(response('/api/v2/friends/{friendId}/timetables/{timetableId}'))
    .toBe('#/components/schemas/ITimetableV2.TimetableDetailResDto')
  expect(response('/api/v2/friends/{friendId}/timetables/my-timetable'))
    .toBe('#/components/schemas/ITimetableV2.MyTimetableResDto')
  expect(schemas['IFriendV2.GetTimetablesResDto'].properties.timetables.items.$ref)
    .toBe('#/components/schemas/ITimetableV2.TimetableSummary')
  expect(schemas['IFriendV2.FriendListItem'].required).toContain('hasScheduleNow')
})
