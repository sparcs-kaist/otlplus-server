import { ECustomblock } from './ECustomblock'

describe('ECustomblock.overlaps', () => {
  it.each([
    [{ day: 0, begin: 600, end: 660 }, { day: 0, begin: 630, end: 690 }, true],
    [{ day: 0, begin: 600, end: 660 }, { day: 0, begin: 660, end: 720 }, false],
    [{ day: 0, begin: 600, end: 660 }, { day: 1, begin: 600, end: 660 }, false],
  ])('compares half-open timetable ranges', (left, right, expected) => {
    expect(ECustomblock.overlaps(left, right)).toBe(expected)
  })
})
