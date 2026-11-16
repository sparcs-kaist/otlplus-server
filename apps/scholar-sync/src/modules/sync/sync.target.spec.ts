import { isFirstRunOfKstDay, selectSyncTargets, SyncTargetSemester, toKstDate } from './sync.target'

// dev DB의 저장 형식(UTC). 수강신청 시작일은 KST 12:30(03:30Z), 수강 변경 종료는 KST 23:59(14:59Z).
const row = (
  year: number,
  semester: number,
  registrationStart: string | null,
  addDropEnd: string | null,
): SyncTargetSemester => ({
  year,
  semester,
  courseRegistrationPeriodStart: registrationStart ? new Date(`${registrationStart}T03:30:00Z`) : null,
  courseAddDropPeriodEnd: addDropEnd ? new Date(`${addDropEnd}T14:59:00Z`) : null,
})

const spring2026 = row(2026, 1, '2026-01-05', '2026-03-09')
const fall2026 = row(2026, 3, '2026-08-10', '2026-09-07')
const winter2026 = row(2026, 4, '2026-11-23', '2026-12-23')
const spring2027 = row(2027, 1, '2027-01-05', '2027-03-08') // 가정

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

describe('selectSyncTargets: 강의 목록·수업 시간', () => {
  it('이번 학기 수강 변경 종료 시각(KST 23:59)까지 이번 학기, 그 뒤로는 다음 학기', () => {
    expect(select('2026-09-07T21:00').lectureTargets).toEqual([[2026, 3]])
    expect(select('2026-09-07T23:59').lectureTargets).toEqual([[2026, 3]])
    expect(select('2026-09-08T00:00').lectureTargets).toEqual([[2026, 4]])
  })

  it('다음 학기 계획서 제출일 전이어도 이전 학기 수강 변경 종료 뒤면 대상이 된다', () => {
    const result = select('2026-10-20T12:00')
    expect(result.lectureTargets).toEqual([[2026, 4]])
    expect(result.takenTargets).toEqual([[2026, 3]])
    expect(result.warnings).toEqual([])
  })

  it('겨울 수강 변경 종료(12-23)까지 겨울, 그 뒤로 다음 봄', () => {
    expect(select('2026-11-10T12:00').lectureTargets).toEqual([[2026, 4]])
    expect(select('2026-12-23T21:00').lectureTargets).toEqual([[2026, 4]])
    expect(select('2026-12-24T00:00').lectureTargets).toEqual([[2027, 1]])
  })

  it('어느 시각이든 대상은 최대 1개이고, 행이 있는 기간에는 빈틈이 없다', () => {
    const start = kst('2025-11-01T00:00').getTime()
    const end = kst('2027-03-08T21:00').getTime()
    for (let t = start; t <= end; t += 3 * 60 * 60 * 1000) {
      expect(selectSyncTargets(rows, new Date(t)).lectureTargets).toHaveLength(1)
    }
  })

  it('여름 행이 없으면 봄 수강 변경 종료 다음은 가을이다', () => {
    const result = select('2026-07-01T12:00')
    expect(result.lectureTargets).toEqual([[2026, 3]])
    expect(result.takenTargets).toEqual([[2026, 1]])
  })

  it('첫 학기는 시작이 열려 있다', () => {
    const result = select('2025-12-01T12:00')
    expect(result.lectureTargets).toEqual([[2026, 1]])
    expect(result.takenTargets).toEqual([])
  })
})

describe('selectSyncTargets: 수강 내역·시험 시간', () => {
  it('다음 학기 수강신청 시작 시각(KST 12:30)부터 넘어간다', () => {
    expect(select('2026-11-23T00:00').takenTargets).toEqual([[2026, 3]])
    expect(select('2026-11-23T12:00').takenTargets).toEqual([[2026, 3]])
    expect(select('2026-11-23T12:30').takenTargets).toEqual([[2026, 4]])
    expect(select('2026-11-23T15:00').takenTargets).toEqual([[2026, 4]])
  })

  it('강의 목록이 다음 학기로 넘어가도 수강신청 시작 전까지는 이전 학기 수강 내역을 동기화한다', () => {
    const midnight = select('2027-01-05T00:00')
    expect(midnight.lectureTargets).toEqual([[2027, 1]])
    expect(midnight.takenTargets).toEqual([[2026, 4]])
    expect(select('2027-01-05T12:00').takenTargets).toEqual([[2026, 4]])
    expect(select('2027-01-05T15:00').takenTargets).toEqual([[2027, 1]])
  })
})

describe('selectSyncTargets: 행 누락·날짜 누락', () => {
  it('다음 학기 행이 없으면 수강 변경 종료 뒤로 강의 목록 대상이 없고 경고한다', () => {
    const input = [spring2026, fall2026]
    const beforeEnd = select('2026-09-07T21:00', input)
    expect(beforeEnd.lectureTargets).toEqual([[2026, 3]])
    expect(beforeEnd.warnings).toEqual([])

    const afterEnd = select('2026-09-08T00:00', input)
    expect(afterEnd.lectureTargets).toEqual([])
    expect(afterEnd.takenTargets).toEqual([[2026, 3]])
    expect(afterEnd.warnings).toEqual([
      '최신 학기 2026-3의 수강 변경 종료가 지났는데 다음 학기 행이 없어 강의 목록 동기화가 멈춤',
    ])
  })

  it('날짜가 빈 행은 대상과 이전/다음 판단에서 빠지고, 최근 2년 행만 경고한다', () => {
    const old = row(2019, 1, null, null)
    const summerWithoutAddDrop = row(2026, 2, '2026-06-01', null)
    const result = select('2026-07-01T12:00', [old, spring2026, summerWithoutAddDrop, fall2026, winter2026])
    // 여름 행이 빠지므로 봄의 다음 학기는 가을
    expect(result.lectureTargets).toEqual([[2026, 3]])
    expect(result.takenTargets).toEqual([[2026, 1]])
    expect(result.warnings).toEqual(['2026-2 학기 행에 날짜가 없어 자동 동기화에서 제외됨'])
  })

  it('입력 순서와 상관없이 같은 결과를 낸다', () => {
    const shuffled = [spring2027, fall2026, spring2026, winter2026]
    expect(select('2026-11-25T12:00', shuffled)).toEqual(select('2026-11-25T12:00'))
  })
})
