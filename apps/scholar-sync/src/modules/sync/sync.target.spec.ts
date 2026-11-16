import { isFirstRunOfKstDay, selectSyncTargets, SyncTargetSemester, toKstDate } from './sync.target'

// dev DB의 실제 저장 값(UTC). 계획서 제출일·수강 취소 마감은 KST 23:59, 수강신청 시작일은 KST 12:30.
const row = (
  year: number,
  semester: number,
  description: string | null,
  registrationStart: string | null,
  dropDeadline: string | null,
): SyncTargetSemester => ({
  year,
  semester,
  courseDesciptionSubmission: description ? new Date(`${description}T14:59:00Z`) : null,
  courseRegistrationPeriodStart: registrationStart ? new Date(`${registrationStart}T03:30:00Z`) : null,
  courseDropDeadline: dropDeadline ? new Date(`${dropDeadline}T14:59:00Z`) : null,
})

const spring2026 = row(2026, 1, '2025-11-07', '2026-01-05', '2026-04-17')
const fall2026 = row(2026, 3, '2026-05-08', '2026-08-10', '2026-10-16')
const winter2026 = row(2026, 4, '2026-11-06', '2026-11-23', '2027-01-04')
const spring2027 = row(2027, 1, '2026-11-07', '2027-01-05', '2027-04-16') // 가정

const rows = [spring2026, fall2026, winter2026, spring2027]

/** KST 시각 문자열('2026-11-06T00:30')을 Date로 */
const kst = (local: string) => new Date(`${local}:00+09:00`)

const select = (local: string, input: SyncTargetSemester[] = rows) => selectSyncTargets(input, kst(local))

describe('toKstDate', () => {
  it('UTC 시각을 KST 날짜로 바꾼다', () => {
    expect(toKstDate(new Date('2026-11-06T14:59:00Z'))).toBe('2026-11-06')
    expect(toKstDate(new Date('2026-11-06T15:00:00Z'))).toBe('2026-11-07')
  })
})

describe('isFirstRunOfKstDay', () => {
  it('KST 00시대만 true', () => {
    expect(isFirstRunOfKstDay(kst('2026-11-15T00:00'))).toBe(true)
    expect(isFirstRunOfKstDay(kst('2026-11-15T02:59'))).toBe(true)
    expect(isFirstRunOfKstDay(kst('2026-11-15T03:00'))).toBe(false)
    expect(isFirstRunOfKstDay(kst('2026-11-15T21:00'))).toBe(false)
  })
})

describe('selectSyncTargets', () => {
  it('가을 수강 취소 마감 이후, 겨울 계획서 제출 전: 강의 대상 없음, 수강 내역은 가을', () => {
    const result = select('2026-10-20T12:00')
    expect(result.lectureTargets).toEqual([])
    expect(result.takenTargets).toEqual([[2026, 3]])
    expect(result.warnings).toEqual([])
  })

  it('계획서 제출 시각(KST 23:59) 이후부터 강의 목록 대상이 된다', () => {
    const before = select('2026-11-06T00:30')
    expect(before.today).toBe('2026-11-06')
    expect(before.lectureTargets).toEqual([])
    expect(before.takenTargets).toEqual([[2026, 3]])

    expect(select('2026-11-06T23:59').lectureTargets).toEqual([[2026, 4]])
    expect(select('2026-11-07T00:00').lectureTargets).toEqual([[2026, 4]])
  })

  it('겨울과 다음 봄 강의 목록은 겹쳐서 모두 대상이 된다', () => {
    const result = select('2026-11-10T12:00')
    expect(result.lectureTargets).toEqual([
      [2026, 4],
      [2027, 1],
    ])
    expect(result.takenTargets).toEqual([[2026, 3]])
  })

  it('다음 학기 수강신청 시작 시각(KST 12:30)부터 수강 내역 대상이 넘어간다', () => {
    expect(select('2026-11-23T00:00').takenTargets).toEqual([[2026, 3]])
    expect(select('2026-11-23T12:00').takenTargets).toEqual([[2026, 3]])
    expect(select('2026-11-23T12:30').takenTargets).toEqual([[2026, 4]])
    expect(select('2026-11-23T15:00').takenTargets).toEqual([[2026, 4]])
  })

  it('수강 취소 마감일은 끝까지 포함된다', () => {
    const result = select('2027-01-04T23:59')
    expect(result.lectureTargets).toEqual([
      [2026, 4],
      [2027, 1],
    ])
    expect(result.takenTargets).toEqual([[2026, 4]])
  })

  it('수강 취소 마감 다음 날에도 수강신청 시작 전까지는 이전 학기 수강 내역을 동기화한다', () => {
    const midnight = select('2027-01-05T00:00')
    expect(midnight.lectureTargets).toEqual([[2027, 1]])
    expect(midnight.takenTargets).toEqual([[2026, 4]])
    expect(select('2027-01-05T12:00').takenTargets).toEqual([[2026, 4]])
  })

  it('수강 내역은 겹치지 않고 다음 학기 수강신청 시작 시각에 바로 넘어간다', () => {
    const result = select('2027-01-05T15:00')
    expect(result.lectureTargets).toEqual([[2027, 1]])
    expect(result.takenTargets).toEqual([[2027, 1]])
  })

  it('여름 행이 없으면 봄의 다음 학기는 가을이다', () => {
    const result = select('2026-07-01T12:00')
    expect(result.lectureTargets).toEqual([[2026, 3]])
    expect(result.takenTargets).toEqual([[2026, 1]])
  })

  it('다음 학기 행이 없으면 마지막 학기의 수강 내역 기간이 계속되고, 수강 취소 마감 이후 경고한다', () => {
    const input = [spring2026, fall2026]
    const beforeDrop = select('2026-10-16T12:00', input)
    expect(beforeDrop.takenTargets).toEqual([[2026, 3]])
    expect(beforeDrop.warnings).toEqual([])

    const afterDrop = select('2026-11-15T12:00', input)
    expect(afterDrop.takenTargets).toEqual([[2026, 3]])
    expect(afterDrop.warnings).toEqual(['최신 학기 2026-3의 수강 취소 마감이 지났는데 다음 학기 행이 없음'])
  })

  it('날짜가 빈 행은 대상과 이전/다음 판단에서 빠지고, 최근 2년 행만 경고한다', () => {
    const old = row(2019, 1, null, null, null)
    const summerWithoutDates = row(2026, 2, null, '2026-06-01', null)
    const result = select('2026-07-01T12:00', [old, spring2026, summerWithoutDates, fall2026, winter2026])
    // 여름 행이 빠지므로 봄의 다음 학기는 가을
    expect(result.takenTargets).toEqual([[2026, 1]])
    expect(result.warnings).toEqual(['2026-2 학기 행에 날짜가 없어 자동 동기화에서 제외됨'])
  })

  it('입력 순서와 상관없이 같은 결과를 낸다', () => {
    const shuffled = [spring2027, fall2026, spring2026, winter2026]
    expect(select('2026-11-25T12:00', shuffled)).toEqual(select('2026-11-25T12:00'))
  })

  it('첫 학기 수강신청 전이면 수강 내역 대상이 없다', () => {
    expect(select('2025-12-01T12:00').takenTargets).toEqual([])
    expect(select('2025-12-01T12:00').lectureTargets).toEqual([[2026, 1]])
  })
})
