# 수강인원 표시 및 빈자리 알림 시스템

## 현재 구현 완료 (2026-02-11)

### 1. 수강인원 표시 기능
- `subject_lecture.enrolled_count` 필드 추가
- `syncTakenLecture()` 실행 시 자동 업데이트
- API 응답에 `enrolled_count`, `vacancy` 필드 추가
- `has_vacancy=true` 쿼리 파라미터로 빈자리 필터링

### 2. 데이터 흐름
```
attend_type2 API (학사 시스템)
    ↓
sync_taken_lectures 테이블 (raw 데이터)
    ↓ GROUP BY lecture_id
subject_lecture.enrolled_count (집계 결과)
    ↓
API 응답: { enrolled_count, vacancy }
```

---

## 후속 작업 목록

### Phase 1: 동기화 스케줄 최적화

#### 수강신청/변경 기간 동기화 스케줄
| 시간대 | 동기화 주기 | 비고 |
|--------|------------|------|
| 09:30-17:00 | 30분 간격 | 수강신청/변경 활발 시간대 |
| 17:30 | 1회 | 당일 마감 후 집계 |
| 09:00 | 1회 | 전일 야간 변경 반영 |

#### 구현 위치
- `apps/scholar-sync/src/modules/sync/sync.schedule.ts`

### Phase 2: WishList 빈자리 알림 시스템

#### 기능 설명
사용자가 WishList에 담은 강의에 빈자리가 생기면 푸시 알림 발송

#### 필요 테이블/필드
```prisma
model timetable_wishlist_lectures {
  // 기존 필드...
  notify_vacancy Boolean @default(false)  // 빈자리 알림 활성화 여부
}
```

#### 알림 발송 로직
```typescript
// 동기화 후 빈자리 발생 강의 탐지
const lecturesWithNewVacancy = lectures.filter(
  l => l.prev_enrolled_count >= l.limit && l.enrolled_count < l.limit
)

// 해당 강의를 wishlist에 담은 사용자 조회 및 알림 발송
```

#### 알림 타입
- `notification.name`: `VACANCY_ALERT`
- `agreementType`: `MARKETING` (마케팅 동의 필요)

### Phase 3: 메인 피드 빈자리 표시

#### 기능 설명
메인 피드에서 인기 강의 중 빈자리가 있는 강의 하이라이트

#### API 엔드포인트
```
GET /api/feed/vacancy-lectures?year=2024&semester=3&limit=10
```

#### 응답 예시
```json
[
  {
    "id": 12345,
    "title": "인공지능개론",
    "limit": 50,
    "enrolled_count": 48,
    "vacancy": 2,
    "professors": [{ "name": "홍길동" }]
  }
]
```

---

## 전산팀 API 대비 (TODO)

### 실시간 수강인원 API가 생기면
현재는 `attend_type2` API의 학생별 데이터를 집계하여 사용중.
전산팀에서 직접 수강인원을 제공하는 API가 생기면:

1. `ScholarApiClient.getEnrollmentCount()` 활성화
2. `syncTakenLecture()` 대신 별도 동기화 메서드 사용
3. 더 빈번한 동기화 가능 (현재: 학기별 3-5만건 → 강의별 수천건)

### 스켈레톤 코드 위치
- `apps/scholar-sync/src/clients/scholar/scholar.api.client.ts`
- `apps/scholar-sync/src/clients/scholar/IScholar.ts`

---

## 관련 파일

| 파일 | 역할 |
|------|------|
| `libs/prisma-client/src/schema.prisma` | enrolled_count 필드 |
| `libs/prisma-client/src/repositories/sync.repository.ts` | 집계/업데이트 메서드 |
| `apps/scholar-sync/src/modules/sync/sync.service.ts` | updateEnrollmentCounts |
| `apps/server/src/common/interfaces/ILecture.ts` | API 응답 타입 |
| `apps/server/src/common/serializer/lecture.serializer.ts` | 직렬화 |
| `libs/prisma-client/src/repositories/lecture.repository.ts` | vacancyFilter |
