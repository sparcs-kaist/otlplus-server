import axios from 'axios'

import { ScholarApiClient } from './scholar.api.client'

jest.mock('axios')
jest.mock('@otl/scholar-sync/settings', () => () => ({ syncConfig: () => ({}) }))

it('checks the scholar response envelope before transforming its rows', async () => {
  const client = new ScholarApiClient()
  const get = jest.mocked(axios.get)
  get.mockResolvedValueOnce({ data: { OutBlock_1: [{ STUDENT_NO: 20250001 }] } })
  expect(await client.getDegree()).toEqual([expect.objectContaining({ STUDENT_NO: 20250001 })])
  get.mockResolvedValueOnce({ data: { OutBlock_1: null } })
  expect(await client.getDegree()).toEqual([])
  get.mockResolvedValueOnce({ data: null })
  expect(await client.getDegree()).toEqual([])
  for (const data of [42, {}, { OutBlock_1: 'invalid' }]) {
    get.mockResolvedValueOnce({ data })
    await expect(client.getDegree()).rejects.toThrow('Invalid scholar response')
  }
})
