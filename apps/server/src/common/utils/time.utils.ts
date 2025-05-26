import { TimeBlockDay } from '@otl/common/enum/time'

export const getTimeNumeric = (time: Date, isClass = true) => {
  const beginNumeric = time.getUTCHours() * 60 + time.getUTCMinutes()
  if (beginNumeric % 30 && isClass) {
    return beginNumeric - (beginNumeric % 30)
  }
  return beginNumeric
}

export const makeTimeBlockDayToDB = (timeblockday: TimeBlockDay): { day: Date | null, weekday: number | null } => ({
  day: timeblockday instanceof Date ? timeblockday : null,
  weekday: timeblockday instanceof Date ? null : timeblockday,
})

export const makeDBtoTimeBlockDay = (day: Date | null, weekday: number | null): TimeBlockDay => {
  if (!day && !weekday) {
    throw new Error('day or weekday is required')
  }
  const res = !day ? weekday : day
  if (!res) {
    throw new Error('day and weekday cannot be both provided')
  }
  return res
}

export const makeTimeIndexToTime = (timeIndex: number) => `${Math.floor(timeIndex / 2) + 8}:${timeIndex % 2 === 0 ? '00' : '30'}~${Math.floor(timeIndex / 2) + 8}:${timeIndex % 2 === 0 ? '30' : '00'}`

export const makeTimeToTimeIndex = (time: string | number): number => {
  if (typeof time === 'string') {
    const [hour, minute] = time.split(':').map(Number)
    return (hour - 8) * 2 + (minute === 0 ? 0 : 1)
  }
  return (time - 8) * 2
}
