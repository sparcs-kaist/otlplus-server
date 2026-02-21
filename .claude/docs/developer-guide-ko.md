# OTL Plus Server 개발자 가이드 🚀

> OTL Plus 백엔드 서버 개발을 위한 실용 가이드입니다.
> 처음 프로젝트에 합류하셨나요? 여기서 시작하세요!

## 목차

- [프로젝트 소개](#프로젝트-소개)
- [5분 만에 시작하기](#5분-만에-시작하기)
- [프로젝트 구조](#프로젝트-구조)
- [주요 앱 설명](#주요-앱-설명)
- [데이터베이스](#데이터베이스)
- [메시지 큐와 캐시](#메시지-큐와-캐시)
- [자주 쓰는 명령어](#자주-쓰는-명령어)
- [개발 팁](#개발-팁)
- [트러블슈팅](#트러블슈팅)

---

## 프로젝트 소개

OTL Plus Server는 KAIST 학생들을 위한 **수강평 및 시간표 플랫폼**의 백엔드입니다.

### 뭘 만들고 있나요?

- 📚 **수강평 시스템**: 학생들이 강의 후기를 작성하고 공유
- 📅 **시간표 관리**: 개인 시간표 생성 및 관리
- 🎓 **졸업 플래너**: 졸업 요건 추적 및 계획
- 🔔 **알림 서비스**: 푸시 알림으로 새 수강평, 좋아요 등 알림
- 🔄 **학사 정보 동기화**: KAIST 학사 시스템과 자동 동기화

### 기술 스택

```
Backend:    NestJS (TypeScript)
Database:   MariaDB (MySQL 호환)
ORM:        Prisma
Cache:      Redis
MQ:         RabbitMQ
Deploy:     Docker + PM2
Monitoring: Sentry
```

---

## 5분 만에 시작하기

### 1. 사전 준비

```bash
# Node.js v20 설치 (nvm 사용 권장)
nvm install 20
nvm use 20

# 의존성 확인
node -v  # v20.17.0
yarn -v  # 1.22.17
```

### 2. 프로젝트 클론 및 설치

```bash
# 레포지토리 클론
git clone https://github.com/sparcs-kaist/otlplus-server.git
cd otlplus-server

# 의존성 설치
yarn install
```

### 3. 환경 설정

```bash
# 환경 변수 파일 복사
cp env/.env.example env/.env.local

# .env.local 파일 편집
# DATABASE_URL, REDIS_URL, RABBITMQ_URL 등 설정
```

### 4. 인프라 실행 (Docker)

```bash
# MySQL, Redis, RabbitMQ 실행
docker compose up -d

# 컨테이너 확인
docker ps
```

### 5. 데이터베이스 초기화

```bash
# Prisma 클라이언트 생성
yarn client:generate

# 마이그레이션 실행
yarn migrate:local
```

### 6. 서버 실행

```bash
# 개발 서버 실행 (Hot Reload)
yarn start:server:local

# 브라우저에서 확인
# http://localhost:8000/api-docs (Swagger 문서)
```

✅ **완료!** 이제 `http://localhost:8000`에서 API가 실행 중입니다.

---

## 프로젝트 구조

### 전체 구조

```
otlplus-server/
├── apps/                    # 🚀 애플리케이션들
│   ├── server/             # 메인 API 서버
│   ├── scholar-sync/       # 학사 정보 동기화
│   ├── notification-consumer/  # 알림 발송
│   └── server-consumer/    # 내부 이벤트 처리
│
├── libs/                    # 📦 공유 라이브러리
│   ├── prisma-client/      # DB 접근 (Prisma)
│   ├── common/             # 공통 유틸
│   ├── rmq/                # RabbitMQ 설정
│   └── redis/              # Redis 설정
│
├── deploy/                  # 🐳 배포 설정 (Docker)
├── .docker/                 # 인프라 서비스 설정
├── env/                     # 환경 변수 파일
└── docker-compose.yml       # 로컬 개발용
```

### 앱별 역할

```
┌────────────────────────────────────────────────────────┐
│                     사용자                              │
└────────────────────┬───────────────────────────────────┘
                     │
                     ↓
            ┌────────────────┐
            │  server (API)  │  ← 메인 REST API
            └────────┬───────┘
                     │
        ┌────────────┼────────────┐
        ↓            ↓            ↓
    ┌───────┐   ┌───────┐   ┌──────────┐
    │ MySQL │   │ Redis │   │ RabbitMQ │
    └───────┘   └───────┘   └─────┬────┘
                                   │
                 ┌─────────────────┼─────────────────┐
                 ↓                 ↓                 ↓
         ┌───────────────┐  ┌──────────────┐  ┌─────────────┐
         │ scholar-sync  │  │ server       │  │notification │
         │ (학사 동기화)  │  │ consumer     │  │consumer     │
         └───────────────┘  │ (이벤트처리)  │  │(푸시알림)   │
                            └──────────────┘  └─────────────┘
```

---

## 주요 앱 설명

### 1. server (메인 API 서버) 🌐

**역할**: 모든 클라이언트 요청을 처리하는 메인 서버

**주요 기능**:
- 사용자 인증 (JWT + 쿠키)
- 강의/과목 정보 조회
- 수강평 CRUD
- 시간표 관리
- 졸업 플래너

**실행**:
```bash
yarn start:server:local
```

**포트**: `8000`

**API 문서**: `http://localhost:8000/api-docs`

#### 모듈 구조

```
apps/server/src/modules/
├── auth/           # 🔐 인증/인가
├── lectures/       # 📖 강의 관리
├── courses/        # 📚 과목 관리
├── reviews/        # ✍️ 수강평
├── timetables/     # 📅 시간표
│   └── v2/         # v2 API (신규)
├── user/           # 👤 사용자
├── planners/       # 🎓 졸업 플래너
├── notification/   # 🔔 알림
└── status/         # ❤️ 헬스체크
```

#### API 예시

```typescript
// GET /api/v1/lectures/:id
// 강의 상세 정보 조회
{
  "id": 123,
  "code": "CS101",
  "title": "프로그래밍 기초",
  "professor": ["홍길동"],
  "credit": 3,
  "grade": 4.2,
  "load": 3.5
}
```

---

### 2. scholar-sync (학사 정보 동기화) 🔄

**역할**: KAIST 학사 시스템(Scholar)에서 강의 정보를 가져와 DB와 동기화

**언제 실행되나요?**
- 학기 초 (새 강의 등록)
- 주기적으로 (수강 인원, 강의 정보 변경사항 체크)
- 수동 트리거 가능

**동작 방식**:
```
1. Scholar API 호출
   ↓
2. 강의 정보 파싱
   ↓
3. DB와 비교 (diff 계산)
   ↓
4. 변경사항 업데이트
   ↓
5. RabbitMQ로 이벤트 발행
   (예: 강의 제목 변경, 수강 인원 변경)
   ↓
6. Slack으로 결과 알림
```

**실행**:
```bash
yarn start:scholar-sync:local
```

**주의사항**:
- Scholar API 키가 필요합니다 (`.env.local`에 설정)
- API Rate Limit이 있으니 너무 자주 실행하지 마세요
- 실패 시 Slack으로 알림이 갑니다

---

### 3. notification-consumer (알림 발송) 🔔

**역할**: RabbitMQ에서 알림 메시지를 받아 Firebase Cloud Messaging(FCM)으로 푸시 알림 전송

**처리하는 알림 종류**:
- 수강평에 좋아요가 달렸을 때
- 새 공지사항
- 광고성 알림
- 시스템 알림

**동작 방식**:
```
RabbitMQ에서 메시지 수신
   ↓
사용자 알림 동의 확인
   ↓
FCM 토큰 조회
   ↓
Firebase로 푸시 알림 전송
   ↓
결과 로깅
```

**실행**:
```bash
yarn start:notification-consumer:local
```

**디버깅 팁**:
```bash
# RabbitMQ 관리 UI에서 큐 확인
# http://localhost:15672
# ID: guest / PW: guest

# 큐에 쌓인 메시지 수 확인
# noti.fcm.queue를 보세요
```

---

### 4. server-consumer (내부 이벤트 처리) ⚙️

**역할**: 서버 내부 이벤트를 비동기로 처리 (주로 통계 업데이트)

**처리하는 이벤트**:
- 강의 평점 재계산 (수강평 작성 시)
- 과목 평점 재계산
- 교수 평점 재계산
- 수강 인원 업데이트
- 수강평 좋아요 수 업데이트

**왜 분리했나요?**
- 메인 API 서버의 응답 속도를 빠르게 유지
- 통계 계산은 시간이 걸리므로 비동기 처리
- 실패 시 재시도 가능

**동작 방식**:
```
사용자가 수강평 작성
   ↓
메인 서버: 수강평 DB 저장 + 응답 즉시 반환
   ↓
메인 서버: RabbitMQ에 "강의 평점 업데이트" 이벤트 발행
   ↓
server-consumer: 이벤트 수신
   ↓
모든 수강평 읽어서 평균 계산
   ↓
강의 테이블 업데이트
```

**실행**:
```bash
yarn start:server-consumer:local
```

---

## 데이터베이스

### Prisma 사용법

#### 1. 스키마 수정

```prisma
// libs/prisma-client/src/schema.prisma

model subject_lecture {
  id            Int      @id @default(autoincrement())
  code          String   @db.VarChar(10)
  title         String   @db.VarChar(200)
  // 새 필드 추가
  enrolled_count Int?    @default(0)  // ← 이렇게 추가
}
```

#### 2. 마이그레이션 생성

```bash
# 마이그레이션 파일 생성
yarn migrate:create:local -- --name add_enrolled_count

# 생성된 파일 위치:
# libs/prisma-client/src/migrations/20260211000000_add_enrolled_count/migration.sql
```

#### 3. SQL 수정 (필요시)

```sql
-- 자동 생성된 SQL을 확인하고 필요시 수정
ALTER TABLE subject_lecture
ADD COLUMN enrolled_count INT DEFAULT 0;

-- 인덱스 추가 등도 가능
CREATE INDEX idx_lecture_enrolled
ON subject_lecture(enrolled_count);
```

#### 4. 마이그레이션 적용

```bash
# 로컬에 적용
yarn migrate:local

# Prisma 클라이언트 재생성
yarn client:generate
```

#### 5. 코드에서 사용

```typescript
// 새 필드 사용
const lecture = await prisma.subject_lecture.findUnique({
  where: { id: 123 }
})

console.log(lecture.enrolled_count)  // ✅ 타입 안전!
```

### 자주 쓰는 Prisma 쿼리

```typescript
// 1. 단일 조회
const lecture = await prisma.subject_lecture.findUnique({
  where: { id: 123 }
})

// 2. 목록 조회
const lectures = await prisma.subject_lecture.findMany({
  where: {
    year: 2024,
    semester: 1
  },
  orderBy: { code: 'asc' },
  take: 10,  // LIMIT
  skip: 20   // OFFSET
})

// 3. 관계 포함 (JOIN)
const lecture = await prisma.subject_lecture.findUnique({
  where: { id: 123 },
  include: {
    subject_course: true,      // 과목 정보
    subject_professor: true,   // 교수 정보
    subject_review: true       // 수강평들
  }
})

// 4. 생성
const review = await prisma.subject_review.create({
  data: {
    user_id: userId,
    lecture_id: lectureId,
    content: '좋은 강의였습니다',
    grade: 5
  }
})

// 5. 업데이트
await prisma.subject_lecture.update({
  where: { id: 123 },
  data: {
    enrolled_count: 50
  }
})

// 6. 삭제
await prisma.subject_review.delete({
  where: { id: 456 }
})

// 7. 트랜잭션
await prisma.$transaction(async (tx) => {
  // 모두 성공하거나 모두 롤백
  await tx.subject_review.create({ ... })
  await tx.subject_lecture.update({ ... })
})

// 8. Raw SQL (필요시)
const result = await prisma.$queryRaw`
  SELECT * FROM subject_lecture
  WHERE year = ${year}
`
```

### DB 관련 명령어

```bash
# 현재 DB 상태 확인
yarn migrate:status:local

# DB 스키마를 Prisma로 가져오기 (역방향)
yarn db:pull

# Prisma 스키마를 DB에 강제 푸시 (개발 전용, 위험!)
yarn db:push

# DB 초기화 (모든 데이터 삭제!)
yarn migrate:reset:local
```

---

## 메시지 큐와 캐시

### RabbitMQ 🐰

#### 큐 구조

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│  Producer   │  ───→ │  Exchange   │  ───→ │    Queue    │  ───→  Consumer
│  (server)   │       │(otl-exchange)│      │ (noti.fcm)  │       (notification)
└─────────────┘       └─────────────┘       └─────────────┘
```

#### 주요 큐

| 큐 이름 | 용도 | Consumer |
|---------|------|----------|
| `noti.fcm.queue` | FCM 푸시 알림 | notification-consumer |
| `noti.info.fcm.queue` | 정보성 알림 | notification-consumer |
| `noti.ad.fcm.queue` | 광고 알림 | notification-consumer |
| `scholar.sync.queue` | 학사 동기화 이벤트 | server-consumer |
| `statistics.update.queue` | 통계 업데이트 | server-consumer |

#### 메시지 발행하기

```typescript
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq'

// 의존성 주입
constructor(
  private readonly amqp: AmqpConnection
) {}

// 알림 발송
await this.amqp.publish(
  'otl-exchange',           // exchange
  'noti.fcm',               // routing key
  {
    userId: 123,
    title: '새 수강평 좋아요',
    body: '누군가 당신의 수강평을 좋아합니다'
  }
)
```

#### RabbitMQ 관리 UI

```
URL: http://localhost:15672
ID:  guest
PW:  guest

여기서 할 수 있는 것:
- 큐에 쌓인 메시지 수 확인
- 메시지 수동으로 발행/확인
- Consumer 연결 상태 확인
```

---

### Redis 💾

#### 캐시 키 규칙

```typescript
// 키 네이밍 패턴
otl:lecture:{id}                    // 강의 상세
otl:lectures:semester:{year}:{sem}  // 학기별 강의 목록
otl:user:{id}                       // 사용자 정보
otl:course:{id}                     // 과목 정보
```

#### 캐시 사용 예시

```typescript
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Cache } from 'cache-manager'

constructor(
  @Inject(CACHE_MANAGER) private cache: Cache
) {}

// 캐시 조회
async getLecture(id: number) {
  const cacheKey = `otl:lecture:${id}`

  // 1. 캐시 확인
  const cached = await this.cache.get(cacheKey)
  if (cached) {
    return cached
  }

  // 2. DB 조회
  const lecture = await this.prisma.subject_lecture.findUnique({
    where: { id }
  })

  // 3. 캐시 저장 (1시간)
  await this.cache.set(cacheKey, lecture, 3600)

  return lecture
}

// 캐시 무효화
async updateLecture(id: number, data: any) {
  await this.prisma.subject_lecture.update({ ... })

  // 캐시 삭제
  const cacheKey = `otl:lecture:${id}`
  await this.cache.del(cacheKey)
}
```

#### Redis CLI 사용

```bash
# Redis 컨테이너 접속
docker exec -it redis-otl redis-cli

# 비밀번호 입력 (env 파일에서 확인)
AUTH your_password

# 키 목록 보기
KEYS otl:*

# 특정 키 값 보기
GET otl:lecture:123

# 키 삭제
DEL otl:lecture:123

# 모든 캐시 삭제 (조심!)
FLUSHALL
```

---

## 자주 쓰는 명령어

### 개발 서버 실행

```bash
# 메인 서버
yarn start:server:local

# Scholar Sync
yarn start:scholar-sync:local

# Notification Consumer
yarn start:notification-consumer:local

# Server Consumer
yarn start:server-consumer:local
```

### 빌드

```bash
# 전체 빌드
yarn build:all

# 개별 빌드
yarn build:server
yarn build:scholar-sync
yarn build:notification-consumer
yarn build:server-consumer
```

### 데이터베이스

```bash
# 마이그레이션 생성
yarn migrate:create:local -- --name your_migration_name

# 마이그레이션 적용
yarn migrate:local

# 마이그레이션 상태 확인
yarn migrate:status:local

# Prisma 클라이언트 재생성
yarn client:generate

# DB 스키마 가져오기
yarn db:pull
```

### 코드 품질

```bash
# 린트 체크
yarn lint

# 린트 자동 수정
yarn lint:fix

# 포맷 체크
yarn format:check

# 포맷 자동 적용
yarn format
```

### 테스트

```bash
# 전체 테스트
yarn test

# Watch 모드
yarn test:watch

# 커버리지
yarn test:cov

# E2E 테스트
yarn test:e2e
```

### Docker

```bash
# 인프라 실행 (MySQL, Redis, RabbitMQ)
docker compose up -d

# 인프라 중지
docker compose down

# 로그 확인
docker compose logs -f

# 특정 서비스만 재시작
docker compose restart redis
```

---

## 개발 팁

### 1. Hot Reload 안 될 때

```bash
# node_modules 삭제 후 재설치
rm -rf node_modules
yarn install

# Prisma 클라이언트 재생성
yarn client:generate
```

### 2. Prisma Studio로 DB 확인

```bash
# Prisma Studio 실행 (DB GUI)
npx prisma studio --schema ./libs/prisma-client/src/schema.prisma

# 브라우저에서 http://localhost:5555 열림
# 테이블 데이터를 GUI로 확인/수정 가능
```

### 3. API 테스트 (REST Client 추천)

VSCode Extension 설치: `REST Client`

```http
### 강의 조회
GET http://localhost:8000/api/v1/lectures/123
Content-Type: application/json

### 로그인
POST http://localhost:8000/api/v1/session/login
Content-Type: application/json

{
  "username": "test",
  "password": "test123"
}

### 수강평 작성
POST http://localhost:8000/api/v1/reviews
Content-Type: application/json
Cookie: access_token=YOUR_JWT_TOKEN

{
  "lectureId": 123,
  "content": "좋은 강의였습니다",
  "grade": 5,
  "load": 3,
  "speech": 4
}
```

### 4. 로그 확인

```bash
# 메인 서버 로그
tail -f apps/server/logs/application-$(date +%Y-%m-%d).log

# 에러 로그만
tail -f apps/server/logs/error-$(date +%Y-%m-%d).log

# 실시간 로그 (개발 서버 실행 중)
# 콘솔에서 바로 확인됨
```

### 5. DB 더미 데이터 생성

```typescript
// 테스트용 스크립트 작성
// scripts/seed.ts

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // 강의 생성
  await prisma.subject_lecture.create({
    data: {
      code: 'CS101',
      title: '프로그래밍 기초',
      year: 2024,
      semester: 1,
      credit: 3
    }
  })

  console.log('✅ 더미 데이터 생성 완료!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
```

```bash
# 실행
yarn ts-node scripts/seed.ts
```

### 6. 타입 체크

```bash
# TypeScript 타입 체크만 실행
npx tsc --noEmit

# Watch 모드로 실행
npx tsc --noEmit --watch
```

---

## 트러블슈팅

### 🔥 자주 겪는 문제들

#### 1. "Prisma Client가 생성되지 않았습니다"

**증상**:
```
Error: Cannot find module '@prisma/client'
```

**해결**:
```bash
yarn client:generate
```

---

#### 2. 마이그레이션 충돌

**증상**:
```
Migration conflict detected
```

**해결**:
```bash
# 1. 현재 상태 확인
yarn migrate:status:local

# 2. 충돌하는 마이그레이션 해결로 표시
yarn migrate:resolve:local --applied 20260211000000_migration_name

# 3. 다시 마이그레이션 적용
yarn migrate:local
```

---

#### 3. Docker 컨테이너가 안 떠요

**증상**:
```
ERROR: ... port is already allocated
```

**해결**:
```bash
# 1. 이미 실행 중인 프로세스 확인
lsof -i :43306  # MySQL
lsof -i :6379   # Redis
lsof -i :5672   # RabbitMQ

# 2. 프로세스 종료
kill -9 PID

# 3. Docker 재시작
docker compose down
docker compose up -d
```

---

#### 4. Redis 연결 실패

**증상**:
```
Error: connect ECONNREFUSED 127.0.0.1:6379
```

**해결**:
```bash
# 1. Redis 컨테이너 상태 확인
docker ps | grep redis

# 2. Redis 컨테이너 재시작
docker compose restart redis

# 3. Redis 로그 확인
docker compose logs redis

# 4. .env.local 설정 확인
# REDIS_URL=redis://localhost:6379
# REDIS_PASSWORD=your_password
```

---

#### 5. RabbitMQ 메시지가 쌓여만 가요

**증상**:
- Consumer가 메시지를 처리하지 않음
- 큐에 메시지가 계속 쌓임

**해결**:
```bash
# 1. Consumer가 실행 중인지 확인
ps aux | grep "notification-consumer"

# 2. Consumer 재시작
yarn start:notification-consumer:local

# 3. RabbitMQ 관리 UI에서 확인
# http://localhost:15672
# Queues 탭에서 Consumer 수 확인

# 4. 메시지 수동으로 삭제 (테스트 환경만!)
# RabbitMQ UI에서 Purge Messages
```

---

#### 6. "Port 8000 already in use"

**해결**:
```bash
# 1. 8000 포트 사용 중인 프로세스 찾기
lsof -ti:8000

# 2. 프로세스 종료
kill -9 $(lsof -ti:8000)

# 3. 서버 재시작
yarn start:server:local
```

---

#### 7. JWT 토큰 인증 실패

**증상**:
```
UnauthorizedException: Invalid token
```

**해결**:
```bash
# 1. JWT_SECRET 확인
# .env.local에서 JWT_SECRET이 설정되어 있는지 확인

# 2. 토큰 재발급
# /api/v1/session/login으로 다시 로그인

# 3. 쿠키 확인
# 브라우저 개발자 도구 > Application > Cookies
# access_token이 있는지 확인
```

---

#### 8. Prisma 쿼리가 너무 느려요

**해결**:
```typescript
// 1. N+1 문제 확인
// ❌ 나쁜 예
const lectures = await prisma.subject_lecture.findMany()
for (const lecture of lectures) {
  // 각 강의마다 쿼리 발생 (N개)
  const course = await prisma.subject_course.findUnique({
    where: { id: lecture.course_id }
  })
}

// ✅ 좋은 예 - include 사용
const lectures = await prisma.subject_lecture.findMany({
  include: {
    subject_course: true  // JOIN으로 한 번에 가져옴
  }
})

// 2. 인덱스 추가 (migration에서)
CREATE INDEX idx_lecture_course ON subject_lecture(course_id);

// 3. 쿼리 로그 확인
// Prisma가 어떤 SQL을 생성하는지 확인
console.log(await prisma.$queryRaw`...`)
```

---

#### 9. 환경 변수가 안 먹혀요

**해결**:
```bash
# 1. .env 파일 위치 확인
ls env/.env.local

# 2. 파일 내용 확인
cat env/.env.local

# 3. 서버 재시작 (환경 변수는 재시작 필요!)
# Ctrl+C 후 다시 실행
yarn start:server:local

# 4. 코드에서 환경 변수 확인
console.log('DATABASE_URL:', process.env.DATABASE_URL)
```

---

#### 10. 마이그레이션이 프로덕션에 안 적용돼요

**해결**:
```bash
# ⚠️ 프로덕션 마이그레이션은 신중하게!

# 1. 마이그레이션 파일 확인
ls libs/prisma-client/src/migrations/

# 2. Dev 환경에서 먼저 테스트
yarn migrate:deploy:dev

# 3. 문제없으면 Prod 적용
yarn migrate:deploy:prod

# 4. 적용 상태 확인
yarn migrate:status:prod
```

---

### 💡 성능 개선 팁

#### 1. 캐시 적극 활용

```typescript
// ❌ 매번 DB 조회
async getLectures() {
  return await this.prisma.subject_lecture.findMany()
}

// ✅ 캐시 사용 (1시간)
async getLectures() {
  const cached = await this.cache.get('otl:lectures:all')
  if (cached) return cached

  const lectures = await this.prisma.subject_lecture.findMany()
  await this.cache.set('otl:lectures:all', lectures, 3600)
  return lectures
}
```

#### 2. 무거운 작업은 비동기로

```typescript
// ❌ 동기 처리 (응답 느림)
@Post('reviews')
async createReview(data: CreateReviewDto) {
  const review = await this.prisma.subject_review.create({ data })

  // 강의 평점 재계산 (시간 걸림)
  await this.updateLectureScore(data.lectureId)

  return review
}

// ✅ 비동기 처리 (응답 빠름)
@Post('reviews')
async createReview(data: CreateReviewDto) {
  const review = await this.prisma.subject_review.create({ data })

  // RabbitMQ로 이벤트 발행 (즉시 반환)
  await this.amqp.publish('statistics.update.lecture.score', {
    lectureId: data.lectureId
  })

  return review  // 빠르게 응답
}
```

#### 3. DB 쿼리 최적화

```typescript
// ❌ 많은 데이터 조회
const allReviews = await prisma.subject_review.findMany()

// ✅ 페이지네이션
const reviews = await prisma.subject_review.findMany({
  take: 20,      // LIMIT
  skip: page * 20,  // OFFSET
  orderBy: { created_at: 'desc' }
})

// ✅ 필요한 필드만 선택
const reviews = await prisma.subject_review.findMany({
  select: {
    id: true,
    content: true,
    grade: true
    // 다른 필드는 제외
  }
})
```

---

### 🎯 디버깅 팁

#### 1. NestJS Logger 사용

```typescript
import { Logger } from '@nestjs/common'

export class LectureService {
  private readonly logger = new Logger(LectureService.name)

  async getLecture(id: number) {
    this.logger.log(`강의 조회 시작: ${id}`)

    try {
      const lecture = await this.prisma.subject_lecture.findUnique({
        where: { id }
      })

      this.logger.log(`강의 조회 성공: ${id}`)
      return lecture

    } catch (error) {
      this.logger.error(`강의 조회 실패: ${id}`, error.stack)
      throw error
    }
  }
}
```

#### 2. Prisma 쿼리 로깅

```typescript
// libs/prisma-client/src/prisma.service.ts

async onModuleInit() {
  await this.$connect()

  // 쿼리 로그 활성화
  this.$on('query', (e) => {
    console.log('Query:', e.query)
    console.log('Params:', e.params)
    console.log('Duration:', e.duration + 'ms')
  })
}
```

#### 3. API 응답 시간 측정

```typescript
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common'
import { Observable } from 'rxjs'
import { tap } from 'rxjs/operators'

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const now = Date.now()
    const request = context.switchToHttp().getRequest()

    return next
      .handle()
      .pipe(
        tap(() => {
          const duration = Date.now() - now
          console.log(`${request.method} ${request.url} - ${duration}ms`)
        })
      )
  }
}
```

---

## 유용한 리소스

### 공식 문서
- [NestJS 공식 문서](https://docs.nestjs.com/)
- [Prisma 공식 문서](https://www.prisma.io/docs)
- [RabbitMQ 튜토리얼](https://www.rabbitmq.com/tutorials)

### 개발 도구
- **Prisma Studio**: DB GUI 툴
- **REST Client** (VSCode Extension): API 테스트
- **Docker Desktop**: 컨테이너 관리 GUI
- **Postman**: API 테스트 (대안)

### 팀 커뮤니케이션
- **Slack**: `#otl-backend` 채널
- **GitHub Issues**: 버그 리포트 및 기능 제안
- **Sentry**: 실시간 에러 모니터링

---

## 마무리

축하합니다! 🎉 이제 OTL Plus Server 개발을 시작할 준비가 되었습니다.

### 다음 단계

1. ✅ 로컬 환경 세팅 완료
2. 📖 코드베이스 둘러보기
3. 🐛 간단한 버그 픽스로 시작
4. 🚀 첫 PR 만들기
5. 👥 코드 리뷰 받기

### 도움이 필요하신가요?

- 막히는 부분이 있으면 Slack에서 질문하세요
- 이슈를 만들어 문제를 공유하세요
- 팀원들에게 페어 프로그래밍을 요청하세요

**Happy Coding! 🚀**

---

**마지막 업데이트**: 2026-02-11
**작성자**: OTL Plus 개발팀
