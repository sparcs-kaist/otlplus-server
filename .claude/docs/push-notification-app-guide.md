# OTL 푸시 알림 시스템 — 앱 팀 가이드

## 목차
1. [아키텍처 개요](#1-아키텍처-개요)
2. [API 명세 — 유저 수신 설정](#2-api-명세--유저-수신-설정)
3. [API 명세 — 알림 이력](#3-api-명세--알림-이력)
4. [API 명세 — 어드민](#4-api-명세--어드민)
5. [FCM 메시지 포맷](#5-fcm-메시지-포맷)
6. [권한 설정 구조](#6-권한-설정-구조)
7. [알림 종류별 상세](#7-알림-종류별-상세)

---

## 1. 아키텍처 개요

```
┌───────────────┐     ┌──────────────────┐     ┌──────────────┐
│  OTL Server   │────▶│   RabbitMQ       │────▶│  Consumer    │
│  (API + 스케줄러) │     │  (Priority Queue)│     │  (배치 FCM)   │
└───────────────┘     └──────────────────┘     └──────┬───────┘
                                                       │
                                                       ▼
                                               ┌──────────────┐
                                               │   FCM        │
                                               │  (Firebase)  │
                                               └──────┬───────┘
                                                       │
                                            ┌──────────┼──────────┐
                                            ▼          ▼          ▼
                                         [iOS]     [Android]   [Web]
```

### 핵심 특징
- **배치 전송**: FCM `sendEach()`로 최대 500건 동시 발송
- **우선순위 큐**: URGENT / NORMAL / LOW 3단계 큐 분리
- **템플릿 엔진**: `{{variable}}` 패턴으로 동적 메시지 렌더링
- **Rate Limiting**: 마케팅 알림 일일 제한 (INFO 무제한, MARKETING 3/일, NIGHT_MARKETING 1/일)
- **Circuit Breaker**: FCM 장애 시 자동 차단 및 복구
- **무효 토큰 자동 정리**: FCM 에러 시 디바이스 비활성화

---

## 2. API 명세 — 유저 수신 설정

> 인증 필요: 모든 엔드포인트에 로그인 쿠키(JWT) 필요

### 2-1. 수신 설정 조회

```
GET /push-notifications/preferences
```

**응답 예시**:
```json
{
  "userId": 17931,
  "info": true,
  "marketing": false,
  "nightMarketing": false,
  "detailVersion": 1,
  "detail": {
    "COURSE_VACANCY": true,
    "COURSE_LOTTERY_REMINDER_1D": true,
    "CLASS_START_REMINDER": false
  },
  "agreedAt": "2026-02-12T00:00:00.000Z",
  "updatedAt": "2026-02-12T00:00:00.000Z"
}
```

**필드 설명**:

| 필드 | 타입 | 설명 |
|------|------|------|
| `info` | boolean | 정보성 알림 수신 동의 (기본: true) |
| `marketing` | boolean | 광고성 알림 수신 동의 (기본: false) |
| `nightMarketing` | boolean | 야간(22시~8시) 광고성 알림 수신 동의 (기본: false) |
| `detail` | object | 세부 알림별 on/off 설정 |
| `detailVersion` | number | 세부 설정 버전 (변경 시 증가) |

> 최초 호출 시 기본값으로 자동 생성됩니다.

---

### 2-2. 대분류 수신 동의 변경

```
PATCH /push-notifications/preferences
```

**요청 바디**:
```json
{
  "marketing": true
}
```

변경할 필드만 포함합니다. 지원 필드: `info`, `marketing`, `nightMarketing`

**응답**: 업데이트된 전체 설정 반환 (2-1과 동일 형태)

---

### 2-3. 세부 알림별 on/off 변경

```
PATCH /push-notifications/preferences/detail
```

**요청 바디**:
```json
{
  "notificationName": "CLASS_START_REMINDER",
  "active": false
}
```

| 필드 | 타입 | 설명 |
|------|------|------|
| `notificationName` | string | 알림 이름 (push_notification.name) |
| `active` | boolean | 해당 알림 수신 여부 |

**응답**: 업데이트된 전체 설정 반환

---

## 3. API 명세 — 알림 이력

### 3-1. 알림 이력 조회

```
GET /push-notifications/history?cursor=100&limit=20
```

**Query Parameters**:

| 파라미터 | 타입 | 기본값 | 설명 |
|----------|------|--------|------|
| `cursor` | number | (없음) | 마지막으로 받은 history.id (이전 페이지의 마지막 항목 id) |
| `limit` | number | 20 | 조회 개수 (최대 100) |

**응답 예시**:
```json
[
  {
    "id": 150,
    "batchId": 3,
    "notificationId": 1,
    "userId": 17931,
    "notificationType": "INFO",
    "priority": "URGENT",
    "title": "데이터구조 빈자리 발생",
    "body": "데이터구조 (김교수) 1분반에 빈자리가 발생했습니다.",
    "status": "SENT",
    "queuedAt": "2026-02-12T10:00:00.000Z",
    "sentAt": "2026-02-12T10:00:01.000Z",
    "readAt": null,
    "createdAt": "2026-02-12T10:00:00.000Z"
  }
]
```

**페이지네이션**: cursor 기반. 다음 페이지를 요청하려면 마지막 항목의 `id`를 `cursor`에 넣으세요.

```
GET /push-notifications/history?cursor=150&limit=20
```

**`readAt`이 `null`이면 읽지 않은 알림**입니다.

---

### 3-2. 알림 읽음 처리

```
PATCH /push-notifications/history/:id/read
```

**Path Parameter**: `id` — history ID

**응답**:
```json
{
  "success": true
}
```

---

## 4. API 명세 — 어드민

> 모든 어드민 API는 `@Admin()` 데코레이터로 보호됩니다.

### 4-1. 알림 생성

```
POST /admin/push-notifications
```

**요청 바디**:
```json
{
  "name": "COURSE_VACANCY",
  "type": "INFO",
  "titleTemplate": "{{courseName}} 빈자리 발생",
  "bodyTemplate": "{{courseName}} ({{professorName}}) 수업에 빈자리가 발생했습니다.",
  "targetType": "SEGMENT",
  "targetFilter": { "departmentIds": [1, 2] },
  "scheduleType": "IMMEDIATE",
  "priority": "URGENT",
  "isActive": true
}
```

| 필드 | 필수 | 설명 |
|------|------|------|
| `name` | O | 고유 식별자 |
| `type` | O | `INFO` / `MARKETING` / `NIGHT_MARKETING` |
| `titleTemplate` | O | 제목 템플릿 (`{{var}}` 지원) |
| `bodyTemplate` | O | 본문 템플릿 |
| `targetType` | O | `ALL` / `SEGMENT` / `MANUAL` |
| `targetFilter` | X | SEGMENT/MANUAL일 때 필터 조건 |
| `scheduleType` | O | `IMMEDIATE` / `ONE_TIME` / `CRON` |
| `scheduleAt` | X | ONE_TIME일 때 예약 시각 |
| `cronExpression` | X | CRON일 때 cron 식 |
| `priority` | X | `URGENT` / `NORMAL`(기본) / `LOW` |
| `digestKey` | X | Digest 그룹키 |
| `digestWindowSec` | X | Digest 윈도우(초) |
| `isActive` | X | 활성 여부 (기본: true) |

### 4-2. 알림 수정

```
PATCH /admin/push-notifications/:id
```

변경할 필드만 포함합니다.

### 4-3. 알림 삭제

```
DELETE /admin/push-notifications/:id
```

### 4-4. 알림 목록 조회

```
GET /admin/push-notifications
```

### 4-5. 알림 상세 조회

```
GET /admin/push-notifications/:id
```

### 4-6. 즉시 발송

```
POST /admin/push-notifications/:id/send
```

**요청 바디** (선택):
```json
{
  "templateVars": {
    "courseName": "데이터구조",
    "professorName": "김교수"
  }
}
```

### 4-7. 발송 상태 조회

```
GET /admin/push-notifications/:id/status
```

**응답**:
```json
{
  "batch": {
    "batchId": "01902dc4-...",
    "totalCount": 1500,
    "sentCount": 1450,
    "failedCount": 50,
    "status": "COMPLETED",
    "startedAt": "...",
    "completedAt": "..."
  },
  "histories": [...]
}
```

---

## 5. FCM 메시지 포맷

앱에서 수신하는 FCM 페이로드 형태입니다.

### 단건 발송 (기존 시스템)

```json
{
  "notification": {
    "title": "알림 제목",
    "body": "알림 본문"
  },
  "data": {
    "requestId": "uuid-v6",
    "notificationName": "COURSE_VACANCY",
    "type": "notification"
  },
  "android": {
    "priority": "high",
    "notification": {
      "sound": "default",
      "channelId": "default"
    }
  },
  "apns": {
    "headers": { "apns-priority": "10" },
    "payload": {
      "aps": {
        "alert": { "title": "...", "body": "..." },
        "sound": "default"
      }
    }
  }
}
```

### 배치 발송 (신규 시스템)

```json
{
  "notification": {
    "title": "렌더링된 제목",
    "body": "렌더링된 본문"
  },
  "data": {
    "requestId": "batch-uuid",
    "notificationName": "1",
    "notificationId": "1"
  },
  "android": {
    "priority": "high",
    "notification": {
      "sound": "default",
      "channelId": "default"
    }
  },
  "apns": {
    "headers": { "apns-priority": "10" },
    "payload": {
      "aps": { "sound": "default" }
    }
  }
}
```

### 앱에서의 처리

1. **Android**: `channelId: "default"` 채널을 미리 생성해 주세요.
2. **iOS**: 기본 사운드로 알림 울림.
3. **`data.notificationName`**: 알림 종류를 구분하여 앱 내 딥링크 처리에 활용.
4. **`data.requestId`**: 알림 읽음 처리(`PATCH /push-notifications/history/:id/read`) 시 서버에서 이력을 추적하는 데 사용.

---

## 6. 권한 설정 구조

### 6-1. 대분류 동의 (법적 요건)

```
info             → 정보성 알림 (서비스 이용에 필요한 알림)
marketing        → 광고성 알림 (프로모션, 이벤트 등)
nightMarketing   → 야간(22시~08시) 광고성 알림
```

**법적 기본값**:
- `info`: `true` (서비스 이용에 필수적 — 사용자가 직접 끌 수 있음)
- `marketing`: `false` (사전 동의 필요)
- `nightMarketing`: `false` (사전 동의 필요)

### 6-2. 세부 알림 설정 (detail)

대분류가 `true`여도 세부 알림별로 개별 on/off 가능.

```json
{
  "COURSE_VACANCY": true,
  "CLASS_START_REMINDER": false,
  "COURSE_LOTTERY_REMINDER_1D": true
}
```

### 6-3. 발송 시 필터링 순서

```
1. push_notification.type 확인 (INFO / MARKETING / NIGHT_MARKETING)
2. user_push_agreement 대분류 동의 확인 (info / marketing / nightMarketing)
3. user_push_agreement.detail에서 해당 알림 이름으로 세부 설정 확인
4. Rate Limit 확인 (MARKETING: 3/일, NIGHT_MARKETING: 1/일)
5. 야간 시간대(22시~08시) + MARKETING 타입 → nightMarketing 미동의 유저 제외
```

**중요**: `detail`에 없는 알림은 기본 `true`로 처리됩니다. (opt-out 방식)

### 6-4. 앱 설정 화면 권장 구성

```
알림 설정
├── 정보성 알림 [toggle: info]
│   ├── 빈자리 알림 [toggle: COURSE_VACANCY]
│   ├── 수강 추첨 알림 [toggle: COURSE_LOTTERY_REMINDER_1D]
│   ├── 수업 시작 알림 [toggle: CLASS_START_REMINDER]
│   └── 동기화 알림 [toggle: SYNC_STARTED]
├── 광고성 알림 [toggle: marketing]
└── 야간 광고성 알림 [toggle: nightMarketing]
    └── (22시~08시 광고성 알림 수신)
```

---

## 7. 알림 종류별 상세

### 정보성 알림 (INFO)

| 알림 | 설명 | 우선순위 |
|------|------|----------|
| `COURSE_VACANCY` | 위시리스트 과목 빈자리 | URGENT |
| `COURSE_LOTTERY_REMINDER_1D` | 수강 추첨 전날 알림 | NORMAL |
| `COURSE_LOTTERY_REMINDER_30M` | 수강 추첨 30분전 | URGENT |
| `COURSE_FIRSTCOME_REMINDER_30M` | 선착순 30분전 | URGENT |
| `COURSE_REGISTRATION_RESULT` | 수강신청 결과 | URGENT |
| `SYNC_STARTED` | 과목 동기화 시작 | NORMAL |
| `DEPARTMENT_COURSE_OPEN` | 학과별 과목 공개 | NORMAL |
| `CLASS_START_REMINDER` | 수업 시작 10분전 | URGENT |

### 광고성 알림 (MARKETING)

| 알림 | 설명 | 우선순위 |
|------|------|----------|
| `PROMO_GENERAL` | 일반 홍보 | LOW |

### 기존 알림 시스템과의 관계

기존 `/notification/*` 및 `/agreement/*` 엔드포인트는 **하위 호환**을 위해 유지됩니다.
신규 `/push-notifications/*` API가 canonical endpoint입니다.

| 기존 API | 신규 API | 비고 |
|----------|----------|------|
| `PATCH /notification/user` | `PATCH /push-notifications/preferences/detail` | 세부 알림 on/off |
| `PATCH /agreement/user` | `PATCH /push-notifications/preferences` | 대분류 동의 변경 |
| `POST /notification/read` | `PATCH /push-notifications/history/:id/read` | 읽음 처리 |
| (없음) | `GET /push-notifications/preferences` | 수신 설정 조회 |
| (없음) | `GET /push-notifications/history` | 알림 이력 조회 |
