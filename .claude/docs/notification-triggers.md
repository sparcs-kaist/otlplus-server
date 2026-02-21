# Push Notification Triggers

각 알림 종류별 트리거 조건, 템플릿 변수, 타겟 설정을 문서화합니다.

## 알림 목록

| 알림 이름 | Type | Priority | TargetType | 트리거 |
|-----------|------|----------|------------|--------|
| `COURSE_VACANCY` | INFO | URGENT | SEGMENT(위시리스트) | 수강변경기간, enrolled_count 변동 |
| `COURSE_LOTTERY_REMINDER_1D` | INFO | NORMAL | ALL | scheduleAt = 추첨일 -1일 |
| `COURSE_LOTTERY_REMINDER_30M` | INFO | URGENT | ALL | scheduleAt = 추첨시작 -30분 |
| `COURSE_FIRSTCOME_REMINDER_30M` | INFO | URGENT | ALL | scheduleAt = 선착순시작 -30분 |
| `COURSE_REGISTRATION_RESULT` | INFO | URGENT | ALL | 추첨 완료 이벤트 |
| `SYNC_STARTED` | INFO | NORMAL | ALL | sync 시작 이벤트 |
| `DEPARTMENT_COURSE_OPEN` | INFO | NORMAL | SEGMENT(학과) | 중간고사 이후 과목 공개 |
| `CLASS_START_REMINDER` | INFO | URGENT | SEGMENT(수강생) | CRON 매일 + classtime 조회 |
| `PROMO_GENERAL` | MARKETING | LOW | ALL(동의자) | 어드민 수동 발송 |

---

## 상세 정의

### 1. `COURSE_VACANCY` — 빈자리 알림

- **Type**: `INFO`
- **Priority**: `URGENT`
- **TargetType**: `SEGMENT`
- **TargetFilter**: `{ userIds: [위시리스트에 해당 과목을 가진 유저들] }`
- **ScheduleType**: `IMMEDIATE`
- **Template Variables**:
  - `{{courseName}}` — 과목명 (e.g., "데이터구조")
  - `{{professorName}}` — 교수명 (e.g., "김교수")
  - `{{classNo}}` — 분반 번호
  - `{{availableCount}}` — 남은 자리 수
- **titleTemplate**: `{{courseName}} 빈자리 발생`
- **bodyTemplate**: `{{courseName}} ({{professorName}}) {{classNo}}분반에 빈자리가 발생했습니다. (잔여 {{availableCount}}석)`
- **트리거 조건**:
  1. `scholar-sync`에서 `enrolled_count` 변동 감지
  2. `enrolled_count < limit` 이면 빈자리 존재
  3. 해당 과목을 위시리스트에 가진 유저를 `timetable_wishlist_lectures` JOIN으로 조회
  4. `sendNotificationNow(id, { courseName, professorName, classNo, availableCount })`
- **관련 테이블**: `subject_lecture`, `timetable_wishlist_lectures`, `sync_taken_lectures`

### 2. `COURSE_LOTTERY_REMINDER_1D` — 수강추첨 전날 알림

- **Type**: `INFO`
- **Priority**: `NORMAL`
- **TargetType**: `ALL`
- **ScheduleType**: `ONE_TIME`
- **scheduleAt**: 추첨일 -1일 (예: `subject_semester.courseRegistrationPeriodStart - 1day`)
- **Template Variables**:
  - `{{semesterName}}` — 학기 (e.g., "2026 봄학기")
  - `{{registrationDate}}` — 추첨일 (e.g., "2월 14일")
- **titleTemplate**: `{{semesterName}} 수강 추첨이 내일입니다`
- **bodyTemplate**: `{{registrationDate}}에 수강 추첨이 시작됩니다. 시간표를 미리 확인해 주세요.`

### 3. `COURSE_LOTTERY_REMINDER_30M` — 수강추첨 30분전 알림

- **Type**: `INFO`
- **Priority**: `URGENT`
- **TargetType**: `ALL`
- **ScheduleType**: `ONE_TIME`
- **scheduleAt**: `subject_semester.courseRegistrationPeriodStart - 30min`
- **Template Variables**: `{{semesterName}}`
- **titleTemplate**: `수강 추첨 30분 전`
- **bodyTemplate**: `{{semesterName}} 수강 추첨이 곧 시작됩니다!`

### 4. `COURSE_FIRSTCOME_REMINDER_30M` — 선착순 30분전 알림

- **Type**: `INFO`
- **Priority**: `URGENT`
- **TargetType**: `ALL`
- **ScheduleType**: `ONE_TIME`
- **scheduleAt**: 선착순 시작 시간 - 30분
- **Template Variables**: `{{semesterName}}`
- **titleTemplate**: `선착순 수강신청 30분 전`
- **bodyTemplate**: `{{semesterName}} 선착순 수강신청이 곧 시작됩니다!`

### 5. `COURSE_REGISTRATION_RESULT` — 수강신청 결과 알림

- **Type**: `INFO`
- **Priority**: `URGENT`
- **TargetType**: `ALL`
- **ScheduleType**: `IMMEDIATE`
- **Template Variables**: `{{semesterName}}`
- **titleTemplate**: `수강신청 결과 확인`
- **bodyTemplate**: `{{semesterName}} 수강신청 결과가 나왔습니다. OTL에서 확인해 보세요.`
- **트리거**: 추첨 완료 후 관리자가 수동 또는 sync 이벤트로 발송

### 6. `SYNC_STARTED` — 과목 동기화 시작 알림

- **Type**: `INFO`
- **Priority**: `NORMAL`
- **TargetType**: `ALL`
- **ScheduleType**: `IMMEDIATE`
- **Template Variables**: `{{semesterName}}`
- **titleTemplate**: `{{semesterName}} 과목 정보 업데이트`
- **bodyTemplate**: `과목 정보가 업데이트되었습니다. 새로운 과목을 확인해 보세요.`
- **트리거**: `scholar-sync`에서 sync 완료 이벤트

### 7. `DEPARTMENT_COURSE_OPEN` — 학과별 과목 공개 알림

- **Type**: `INFO`
- **Priority**: `NORMAL`
- **TargetType**: `SEGMENT`
- **TargetFilter**: `{ departmentIds: [해당 학과 ID] }`
- **ScheduleType**: `IMMEDIATE`
- **Template Variables**:
  - `{{departmentName}}` — 학과명
  - `{{courseCount}}` — 새로 공개된 과목 수
- **titleTemplate**: `{{departmentName}} 신규 과목 공개`
- **bodyTemplate**: `{{departmentName}}에서 {{courseCount}}개의 새로운 과목이 공개되었습니다.`

### 8. `CLASS_START_REMINDER` — 수업 시작 10분전 알림

- **Type**: `INFO`
- **Priority**: `URGENT`
- **TargetType**: `SEGMENT`
- **TargetFilter**: `{ userIds: [해당 시간 수업이 있는 학생들] }`
- **ScheduleType**: `CRON`
- **cronExpression**: `0 */10 8-21 * * 1-5` (평일 08:00~21:50, 매 10분)
- **Template Variables**:
  - `{{courseName}}` — 과목명
  - `{{location}}` — 강의실 (e.g., "E11 101호")
  - `{{startTime}}` — 시작 시간 (e.g., "13:00")
- **titleTemplate**: `{{courseName}} 수업 10분 전`
- **bodyTemplate**: `{{startTime}} {{location}}에서 {{courseName}} 수업이 시작됩니다.`
- **구현 참고**: CRON으로 주기 실행 → `subject_classtime` 조회 → 10분 내 시작하는 수업 탐색 → 해당 수강생에게 발송

### 9. `PROMO_GENERAL` — 홍보성 알림

- **Type**: `MARKETING`
- **Priority**: `LOW`
- **TargetType**: `ALL` (마케팅 동의자만)
- **ScheduleType**: `IMMEDIATE` 또는 `ONE_TIME`
- **Template Variables**: 자유 정의
- **titleTemplate**: 어드민이 직접 작성
- **bodyTemplate**: 어드민이 직접 작성
- **트리거**: 어드민이 수동 발송 (`POST /admin/push-notifications/:id/send`)
