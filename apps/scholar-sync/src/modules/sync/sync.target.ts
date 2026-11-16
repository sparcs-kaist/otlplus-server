import type { subject_semester } from '@prisma/client'

// 이 파일은 jest에서 바로 테스트할 수 있도록 @otl/scholar-sync alias를 쓰지 않는다.

export type SyncTargetSemester = Pick<
  subject_semester,
  'year' | 'semester' | 'courseRegistrationPeriodStart' | 'courseAddDropPeriodEnd'
>

export type SemesterKey = [number, number]

export interface SyncTargets {
  /** 기준 시각의 KST 날짜. 표시와 R5 경고의 "최근 2년" 판단에만 쓴다. */
  today: string
  /** 강의 목록(강의·담당 교수)·수업 시간 대상. 0~1개. */
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

/** 시각을 KST 기준 날짜 'YYYY-MM-DD'로 바꾼다. 대상 판단에는 쓰지 않는다(시각 그대로 비교). */
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
  registrationStart: number
  addDropEnd: number
}

/**
 * 자동 동기화 대상 학기를 데이터 종류별로 고른다.
 *
 * - 강의 목록·수업 시간: 이전 학기 수강 변경 종료 < now ≤ 이번 학기 수강 변경 종료인 학기 (0~1개, 첫 학기는 시작이 열려 있음)
 * - 수강 내역·시험 시간: 수강신청 시작 ≤ now < 다음 학기 수강신청 시작인 학기 (다음 학기 행이 없으면 끝이 열려 있음)
 * - 이전/다음 학기는 날짜가 모두 있는 행을 (연도, 학기) 순으로 정렬해 판단한다.
 * - DB 값은 UTC 시각으로 저장돼 있으므로 시각 그대로 비교한다.
 */
export function selectSyncTargets(rows: SyncTargetSemester[], now: Date): SyncTargets {
  const today = toKstDate(now)
  const currentYear = Number(today.slice(0, 4))
  const nowTime = now.getTime()
  const warnings: string[] = []

  const complete: CompleteSemester[] = []
  for (const row of rows) {
    const { courseRegistrationPeriodStart, courseAddDropPeriodEnd } = row
    if (!courseRegistrationPeriodStart || !courseAddDropPeriodEnd) {
      if (row.year >= currentYear - 1) {
        warnings.push(`${formatSemester(row)} 학기 행에 날짜가 없어 자동 동기화에서 제외됨`)
      }
      continue
    }
    complete.push({
      year: row.year,
      semester: row.semester,
      registrationStart: courseRegistrationPeriodStart.getTime(),
      addDropEnd: courseAddDropPeriodEnd.getTime(),
    })
  }
  complete.sort((a, b) => a.year - b.year || a.semester - b.semester)

  const lectureTargets: SemesterKey[] = complete
    .filter((s, i) => {
      const prev = complete[i - 1]
      return (!prev || prev.addDropEnd < nowTime) && nowTime <= s.addDropEnd
    })
    .map((s) => [s.year, s.semester])

  const takenTargets: SemesterKey[] = complete
    .filter((s, i) => {
      const next = complete[i + 1]
      return s.registrationStart <= nowTime && (!next || nowTime < next.registrationStart)
    })
    .map((s) => [s.year, s.semester])

  const latest = complete[complete.length - 1]
  if (latest && latest.addDropEnd < nowTime) {
    warnings.push(
      `최신 학기 ${formatSemester(latest)}의 수강 변경 종료가 지났는데 다음 학기 행이 없어 강의 목록 동기화가 멈춤`,
    )
  }

  return {
    today,
    lectureTargets,
    takenTargets,
    warnings,
  }
}
