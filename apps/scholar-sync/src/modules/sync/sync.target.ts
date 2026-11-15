import type { subject_semester } from '@prisma/client'

// 이 파일은 jest에서 바로 테스트할 수 있도록 @otl/scholar-sync alias를 쓰지 않는다.

export type SyncTargetSemester = Pick<
  subject_semester,
  'year' | 'semester' | 'courseDesciptionSubmission' | 'courseRegistrationPeriodStart' | 'courseDropDeadline'
>

export type SemesterKey = [number, number]

export interface SyncTargets {
  today: string
  /** 강의 목록(강의·담당 교수)·수업 시간 대상. 오래된 학기부터. */
  lectureTargets: SemesterKey[]
  /** 수강 내역·시험 시간 대상. 0~1개. */
  takenTargets: SemesterKey[]
  warnings: string[]
}

const KST = 'Asia/Seoul'

const kstDateFormat = new Intl.DateTimeFormat('en-CA', {
  timeZone: KST,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

const kstHourFormat = new Intl.DateTimeFormat('en-US', {
  timeZone: KST,
  hour: 'numeric',
  hourCycle: 'h23',
})

/** 시각을 KST 기준 날짜 'YYYY-MM-DD'로 바꾼다. DB 값은 UTC 시각으로 저장돼 있으므로 UTC 날짜를 그대로 쓰면 안 된다. */
export function toKstDate(date: Date): string {
  return kstDateFormat.format(date)
}

/** 3시간 주기 cron에서 KST 기준 하루의 첫 실행(00시대)인지. 하루 1번 보내는 경고에 쓴다. */
export function isFirstRunOfKstDay(now: Date): boolean {
  return Number(kstHourFormat.format(now)) < 3
}

const formatSemester = (row: Pick<SyncTargetSemester, 'year' | 'semester'>) => `${row.year}-${row.semester}`

type CompleteSemester = {
  year: number
  semester: number
  description: string
  registrationStart: string
  dropDeadline: string
}

/**
 * 자동 동기화 대상 학기를 데이터 종류별로 고른다. (docs/plans/seasonal-semester.md D1, R4~R6, R8)
 *
 * - 강의 목록·수업 시간: 계획서 제출일 ≤ 오늘 ≤ 수강 취소 마감인 학기 전부
 * - 수강 내역·시험 시간: 수강신청 시작일 ≤ 오늘 < 다음 학기 수강신청 시작일인 학기 (다음 학기 행이 없으면 끝이 열려 있음)
 * - 이전/다음 학기는 날짜가 모두 있는 행을 (연도, 학기) 순으로 정렬해 판단한다.
 */
export function selectSyncTargets(rows: SyncTargetSemester[], now: Date): SyncTargets {
  const today = toKstDate(now)
  const currentYear = Number(today.slice(0, 4))
  const warnings: string[] = []

  const complete: CompleteSemester[] = []
  for (const row of rows) {
    const { courseDesciptionSubmission, courseRegistrationPeriodStart, courseDropDeadline } = row
    if (!courseDesciptionSubmission || !courseRegistrationPeriodStart || !courseDropDeadline) {
      if (row.year >= currentYear - 1) {
        warnings.push(`${formatSemester(row)} 학기 행에 날짜가 없어 자동 동기화에서 제외됨`)
      }
      continue
    }
    complete.push({
      year: row.year,
      semester: row.semester,
      description: toKstDate(courseDesciptionSubmission),
      registrationStart: toKstDate(courseRegistrationPeriodStart),
      dropDeadline: toKstDate(courseDropDeadline),
    })
  }
  complete.sort((a, b) => a.year - b.year || a.semester - b.semester)

  const lectureTargets: SemesterKey[] = complete
    .filter((s) => s.description <= today && today <= s.dropDeadline)
    .map((s) => [s.year, s.semester])

  const takenTargets: SemesterKey[] = complete
    .filter((s, i) => {
      const next = complete[i + 1]
      return s.registrationStart <= today && (!next || today < next.registrationStart)
    })
    .map((s) => [s.year, s.semester])

  const latest = complete[complete.length - 1]
  if (latest && latest.dropDeadline < today) {
    warnings.push(`최신 학기 ${formatSemester(latest)}의 수강 취소 마감이 지났는데 다음 학기 행이 없음`)
  }

  return {
    today,
    lectureTargets,
    takenTargets,
    warnings,
  }
}
