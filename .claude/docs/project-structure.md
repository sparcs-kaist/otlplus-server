# OTL Plus Server - Technical Documentation

## Document Purpose

This document provides comprehensive technical documentation for AI agents and developers working on the OTL Plus Server codebase. It describes the system architecture, component interactions, data flows, and technical implementation details.

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Architecture](#architecture)
3. [Technology Stack](#technology-stack)
4. [Monorepo Structure](#monorepo-structure)
5. [Application Services](#application-services)
6. [Shared Libraries](#shared-libraries)
7. [Data Layer](#data-layer)
8. [Message Queue Architecture](#message-queue-architecture)
9. [Caching Strategy](#caching-strategy)
10. [Authentication & Authorization](#authentication--authorization)
11. [API Structure](#api-structure)
12. [Deployment Architecture](#deployment-architecture)
13. [Development Workflow](#development-workflow)
14. [Testing Strategy](#testing-strategy)
15. [Monitoring & Observability](#monitoring--observability)

---

## System Overview

### Purpose

OTL Plus Server is the backend infrastructure for KAIST's course evaluation and timetable management platform. It provides RESTful APIs for course information, student reviews, timetable creation, and academic planning.

### System Type

- **Architecture Pattern**: Microservices-based monorepo
- **Communication**: Synchronous (REST) + Asynchronous (Message Queue)
- **Deployment**: Containerized (Docker) with PM2 process management
- **Scaling**: Horizontal scaling with load balancing

### Key Characteristics

- **High Availability**: Multi-instance deployment with health checks
- **Event-Driven**: RabbitMQ-based message queue for async operations
- **Cache-First**: Redis caching layer for performance optimization
- **Transaction Safety**: CLS (Continuation-Local Storage) based transaction management
- **Type Safety**: Full TypeScript implementation with strict mode
- **API Versioning**: URI-based versioning (v1, v2)

---

## Architecture

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         Load Balancer                           │
└────────────────────────────┬────────────────────────────────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        ▼                    ▼                    ▼
┌───────────────┐   ┌───────────────┐   ┌───────────────┐
│   Server      │   │   Server      │   │   Server      │
│   Instance 1  │   │   Instance 2  │   │   Instance N  │
│   (Port 8000) │   │   (Port 8000) │   │   (Port 8000) │
└───────┬───────┘   └───────┬───────┘   └───────┬───────┘
        │                   │                    │
        └───────────────────┼────────────────────┘
                            │
        ┌───────────────────┼────────────────────┐
        │                   │                    │
        ▼                   ▼                    ▼
┌───────────────┐   ┌───────────────┐   ┌───────────────┐
│   Redis       │   │   RabbitMQ    │   │   MariaDB     │
│   Cache       │   │   Message Q   │   │   Database    │
└───────────────┘   └───────┬───────┘   └───────────────┘
                            │
        ┌───────────────────┼────────────────────┐
        │                   │                    │
        ▼                   ▼                    ▼
┌───────────────┐   ┌───────────────┐   ┌───────────────┐
│ Scholar-Sync  │   │ Server        │   │ Notification  │
│ Worker        │   │ Consumer      │   │ Consumer      │
└───────────────┘   └───────────────┘   └───────────────┘
        │                   │                    │
        └───────────────────┼────────────────────┘
                            │
                            ▼
                    ┌───────────────┐
                    │   Slack API   │
                    │   Firebase    │
                    │   Scholar API │
                    └───────────────┘
```

### Architectural Patterns

#### 1. Microservices Pattern
- **server**: Main API gateway and business logic
- **scholar-sync**: External data synchronization service
- **notification-consumer**: Push notification delivery service
- **server-consumer**: Internal event processing service

#### 2. Event-Driven Architecture
- Services communicate via RabbitMQ message queues
- Asynchronous processing for non-critical operations
- Event sourcing for audit trails and statistics

#### 3. CQRS (Command Query Responsibility Segregation)
- Read operations: Cached via Redis, optimized queries
- Write operations: Transactional with event emission
- Separate read replicas for database (via Prisma)

#### 4. Repository Pattern
- Data access abstraction via Prisma repositories
- Centralized query logic in `libs/prisma-client/src/repositories/`
- Type-safe query builders

#### 5. Module-Based Architecture (NestJS)
- Feature modules: Self-contained business domains
- Shared modules: Cross-cutting concerns
- Dynamic modules: Configuration and infrastructure

---

## Technology Stack

### Runtime & Framework

| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| **Runtime** | Node.js | v20.17.0 | JavaScript runtime |
| **Framework** | NestJS | v10.4.15 | Backend framework |
| **Language** | TypeScript | v5.7.2 | Type-safe development |
| **Package Manager** | Yarn | v1.22.17 | Dependency management |
| **Process Manager** | PM2 | v5.4.3 | Production process management |

### Database & ORM

| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| **Database** | MariaDB | 10.x (MySQL 5.7 compatible) | Primary data store |
| **ORM** | Prisma | v6.12.0 | Database access layer |
| **Adapter** | @prisma/adapter-mariadb | v6.12.0 | MariaDB-specific adapter |
| **Migration Tool** | Prisma Migrate | v6.12.0 | Schema versioning |

### Caching & Message Queue

| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| **Cache** | Redis | v7.2 | Application cache |
| **Cache Client** | IORedis | v5.6.1 | Redis client library |
| **Message Queue** | RabbitMQ | v3.x | Async messaging |
| **MQ Client** | @golevelup/nestjs-rabbitmq | v5.7.0 | RabbitMQ integration |

### Authentication & Security

| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| **JWT** | @nestjs/jwt | v10.2.0 | Token-based auth |
| **Session** | express-session | v1.18.1 | Session management |
| **Password Hashing** | bcrypt | v5.1.1 | Password encryption |
| **CSRF Protection** | csurf | v1.11.0 | CSRF token validation |

### External Services

| Service | Purpose | Integration |
|---------|---------|-------------|
| **Firebase Cloud Messaging** | Push notifications | firebase-admin v13.3.0 |
| **Sentry** | Error tracking & monitoring | @sentry/nestjs v9.17.0 |
| **Slack** | Internal notifications | @slack/web-api v7.8.0 |
| **Scholar API** | KAIST academic data | Axios HTTP client |

### Build & Development Tools

| Tool | Purpose | Version |
|------|---------|---------|
| **ESLint** | Code linting | v9.17.0 |
| **Prettier** | Code formatting | v3.4.2 |
| **Jest** | Testing framework | v29.7.0 |
| **Husky** | Git hooks | v9.1.7 |
| **Docker** | Containerization | Latest |

---

## Monorepo Structure

### Directory Layout

```
otlplus-server/
├── apps/                           # Application services
│   ├── server/                     # Main API server
│   │   ├── src/
│   │   │   ├── bootstrap/         # Application initialization
│   │   │   ├── modules/           # Feature modules
│   │   │   │   ├── auth/          # Authentication & authorization
│   │   │   │   ├── courses/       # Course management
│   │   │   │   ├── lectures/      # Lecture management
│   │   │   │   ├── reviews/       # Review system
│   │   │   │   ├── timetables/    # Timetable management
│   │   │   │   │   └── v2/        # Version 2 API
│   │   │   │   ├── user/          # User management
│   │   │   │   ├── notification/  # Notification system
│   │   │   │   ├── planners/      # Graduation planner
│   │   │   │   └── ...            # Other modules
│   │   │   ├── common/            # Shared resources
│   │   │   ├── settings.ts        # Configuration
│   │   │   ├── app.module.ts      # Root module
│   │   │   └── app.controller.ts  # Root controller
│   │   ├── docs/                  # API documentation
│   │   │   └── swagger.json       # OpenAPI specification
│   │   ├── logs/                  # Application logs
│   │   └── tsconfig.app.json      # TypeScript config
│   │
│   ├── scholar-sync/              # Academic data sync service
│   │   ├── src/
│   │   │   ├── clients/
│   │   │   │   └── scholar/       # Scholar API client
│   │   │   ├── modules/
│   │   │   │   └── sync/          # Sync orchestration
│   │   │   └── common/
│   │   │       └── domain/        # Domain models
│   │   └── README.md
│   │
│   ├── notification-consumer/     # FCM notification worker
│   │   ├── src/
│   │   │   ├── app.controller.ts  # Message handlers
│   │   │   ├── app.service.ts     # Business logic
│   │   │   └── out/               # External integrations
│   │   └── tsconfig.app.json
│   │
│   └── server-consumer/           # Internal event worker
│       ├── src/
│       │   ├── app.controller.ts  # Event handlers
│       │   ├── app.service.ts     # Event processing
│       │   └── messages/          # Message definitions
│       └── tsconfig.app.json
│
├── libs/                          # Shared libraries
│   ├── prisma-client/             # Database access layer
│   │   ├── src/
│   │   │   ├── schema.prisma      # Database schema
│   │   │   ├── migrations/        # Migration files
│   │   │   ├── repositories/      # Repository pattern
│   │   │   ├── types/             # Type definitions
│   │   │   ├── prisma.module.ts   # Prisma module
│   │   │   └── prisma.service.ts  # Prisma service
│   │   └── tsconfig.lib.json
│   │
│   ├── common/                    # Common utilities
│   │   ├── src/
│   │   │   ├── logger/            # Winston logger
│   │   │   ├── exception/         # Error handlers
│   │   │   ├── enum/              # Enums
│   │   │   └── interfaces/        # Type definitions
│   │   └── tsconfig.lib.json
│   │
│   ├── rmq/                       # RabbitMQ utilities
│   │   ├── src/
│   │   │   ├── rmq.module.ts      # RabbitMQ module
│   │   │   ├── settings.ts        # Queue configuration
│   │   │   └── decorator/         # Custom decorators
│   │   └── tsconfig.lib.json
│   │
│   └── redis/                     # Redis utilities
│       ├── src/
│       │   └── redis.module.ts    # Redis module
│       └── tsconfig.lib.json
│
├── deploy/                        # Deployment configurations
│   ├── server/
│   │   └── docker/
│   │       ├── Dockerfile.server
│   │       ├── docker-compose.dev.yml
│   │       ├── docker-compose.prod.yml
│   │       └── docker-compose.local.yml
│   ├── scholar-sync/docker/
│   ├── server-consumer/docker/
│   └── notification-consumer/docker/
│
├── .docker/                       # Infrastructure services
│   ├── rabbitmq/                  # RabbitMQ setup
│   ├── redis/                     # Redis cache
│   └── redis-scheduler/           # Redis for scheduling
│
├── env/                           # Environment variables
│   ├── .env.example
│   ├── .env.local
│   ├── .env.dev
│   ├── .env.prod
│   └── .env.test
│
├── .github/workflows/             # CI/CD pipelines
│   ├── ci.yml                     # Continuous integration
│   ├── cd-dev.yml                 # Deployment to dev
│   └── code-review.yml            # Automated code review
│
├── nest-cli.json                  # NestJS CLI configuration
├── tsconfig.json                  # Base TypeScript config
├── package.json                   # Root package manifest
├── docker-compose.yml             # Local development stack
└── ecosystem.config.js            # PM2 configuration
```

### TypeScript Path Mapping

The project uses TypeScript path aliases for clean imports:

```typescript
// tsconfig.json paths configuration
{
  "@otl/common": ["libs/common/src"],
  "@otl/common/*": ["libs/common/src/*"],
  "@otl/prisma-client": ["libs/prisma-client/src"],
  "@otl/prisma-client/*": ["libs/prisma-client/src/*"],
  "@otl/rmq": ["libs/rmq/src"],
  "@otl/rmq/*": ["libs/rmq/src/*"],
  "@otl/redis": ["libs/redis/src"],
  "@otl/redis/*": ["libs/redis/src/*"],
  "@otl/server-nest/*": ["apps/server/src/*"],
  "@otl/scholar-sync/*": ["apps/scholar-sync/src/*"],
  "@otl/notification-consumer/*": ["apps/notification-consumer/src/*"],
  "@otl/server-consumer/*": ["apps/server-consumer/src/*"]
}
```

---

## Application Services

### 1. Server (Main API Service)

**Service Type**: HTTP REST API Server
**Port**: 8000
**Process Management**: PM2 (max-old-space-size=40920 MB)

#### Responsibilities

1. **User Authentication & Authorization**
   - JWT-based authentication
   - Cookie-based session management
   - Role-based access control (RBAC)
   - CSRF protection

2. **Course & Lecture Management**
   - Course information retrieval
   - Lecture details and schedules
   - Department and major information
   - Semester management

3. **Review System**
   - User-generated course reviews
   - Review creation, editing, deletion
   - Like/dislike functionality
   - Review moderation

4. **Timetable Management**
   - Personal timetable creation
   - Multiple timetable support
   - Lecture addition/removal
   - Custom block creation
   - Conflict detection

5. **Academic Planning**
   - Graduation requirement tracking
   - Major/minor planning
   - Credit calculation
   - Course recommendation

6. **Notification System**
   - In-app notifications
   - Push notification triggering
   - Notification preferences

7. **Social Features**
   - Timetable sharing
   - Review interactions
   - Wishlist management

#### Module Architecture

```
AppModule (Root)
├── AuthModule
│   ├── JwtStrategy
│   ├── AuthGuard (Global)
│   └── AuthConfig
├── UserModule
│   ├── UserService
│   └── UserController
├── CoursesModule
│   ├── CoursesService
│   └── CoursesController
├── LecturesModule
│   ├── LecturesService
│   └── LecturesController
├── ReviewsModule
│   ├── ReviewsService
│   └── ReviewsController
├── TimetablesModule (v1)
│   ├── TimetablesService
│   └── TimetablesController
├── TimetablesModuleV2 (v2)
│   ├── TimetablesService
│   └── TimetablesController
├── NotificationModule
│   ├── NotificationService
│   └── NotificationController
├── PlannersModule
│   ├── PlannersService
│   └── PlannersController
├── StatusModule (Health checks)
│   └── StatusController
└── ...
```

#### Request Flow

```
Client Request
    ↓
Load Balancer
    ↓
Express Middleware Stack
    ├── CORS Handler
    ├── Cookie Parser
    ├── Session Middleware
    ├── CSRF Protection
    └── JSON Body Parser
    ↓
NestJS Pipeline
    ├── Global Exception Filter
    ├── Global Validation Pipe
    ├── Global Auth Guard
    └── Logging Interceptor
    ↓
Controller → Service → Repository
    ↓
Prisma Client
    ↓
Database (with connection pool)
    ↓
Response Cache (Redis)
    ↓
Response to Client
```

#### API Versioning Strategy

- **URI-Based Versioning**: `/api/v1/...` and `/api/v2/...`
- **Version 1**: Legacy endpoints, maintained for backward compatibility
- **Version 2**: New features and improvements
- **Migration Path**: Gradual migration with parallel support

Example:
```typescript
// V1 endpoint
@Controller('v1/timetables')
export class TimetablesController { ... }

// V2 endpoint with improvements
@Controller('v2/timetables')
export class TimetablesControllerV2 { ... }
```

#### Configuration Management

Configuration is environment-based via `settings.ts`:

```typescript
// apps/server/src/settings.ts
interface Settings {
  getCorsConfig(): CorsOptions
  ormconfig(): PrismaOptions
  getRedisConfig(): RedisConfig
  getSentryConfig(): SentryOptions
}

// Usage
const settings = settings()
app.enableCors(settings.getCorsConfig())
```

Environment-specific configurations:
- **Local**: Development database, permissive CORS
- **Dev**: Development server, limited CORS origins
- **Prod**: Production database, strict CORS, optimized caching

#### Startup Process

```typescript
// apps/server/src/bootstrap/bootstrap.ts
async function bootstrap() {
  // 1. Initialize Sentry for error tracking
  Sentry.init({ dsn, tracesSampleRate: 1.0 })

  // 2. Create NestJS application
  const app = await NestFactory.create(AppModule)

  // 3. Enable API versioning
  app.enableVersioning({ type: VersioningType.URI })

  // 4. Configure CORS
  app.enableCors(settings().getCorsConfig())

  // 5. Setup global validation
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true
  }))

  // 6. Setup session and security
  app.use(session({ ... }))
  app.use(cookieParser())
  app.use(csrf({ ... }))

  // 7. Mount Swagger documentation
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))

  // 8. Initialize database (upsert agreements)
  initializeDB(prismaService)

  // 9. Start listening
  await app.listen(8000)
}
```

---

### 2. Scholar-Sync (Data Synchronization Service)

**Service Type**: Scheduled Worker / Cron Job
**Trigger**: Time-based or manual API call
**External Dependency**: KAIST Scholar API

#### Responsibilities

1. **Data Collection**
   - Fetch lecture data from Scholar API
   - Parse and validate incoming data
   - Handle API rate limiting and retries

2. **Data Transformation**
   - Convert Scholar API format to internal schema
   - Normalize Korean/English text
   - Calculate derived fields (credits, hours)

3. **Data Synchronization**
   - Compare with existing database records
   - Identify changes (new, updated, deleted lectures)
   - Batch update database efficiently

4. **Event Publishing**
   - Emit events for lecture changes
   - Trigger statistics recalculation
   - Notify dependent services

5. **Error Handling**
   - Retry failed API calls
   - Log sync errors to Slack
   - Maintain sync status records

#### Synchronization Flow

```
Scheduled Trigger / Manual API Call
    ↓
Scholar-Sync Service
    ↓
[1] Fetch Active Semester
    ↓
[2] Call Scholar API
    ├── /courses
    ├── /lectures
    └── /professors
    ↓
[3] Parse & Validate Data
    ├── Schema validation
    ├── Data normalization
    └── Duplicate detection
    ↓
[4] Calculate Diff
    ├── New lectures
    ├── Updated lectures
    └── Deleted lectures
    ↓
[5] Database Transaction
    ├── Upsert lectures
    ├── Update professors
    └── Update courses
    ↓
[6] Publish Events to RabbitMQ
    ├── LECTURE_TITLE_CHANGED
    ├── LECTURE_ENROLLED_COUNT_CHANGED
    └── COURSE_REPRESENTATIVE_LECTURE_CHANGED
    ↓
[7] Notify Slack
    ├── Sync summary
    ├── Error report
    └── Statistics
    ↓
Complete
```

#### Scholar API Client

```typescript
// apps/scholar-sync/src/clients/scholar/scholar.api.client.ts
export interface IScholarClient {
  getLectures(year: number, semester: number): Promise<Lecture[]>
  getCourses(): Promise<Course[]>
  getProfessors(): Promise<Professor[]>
}

export class ScholarApiClient implements IScholarClient {
  constructor(
    private readonly httpClient: HttpService,
    private readonly config: ScholarApiConfig
  ) {}

  async getLectures(year: number, semester: number): Promise<Lecture[]> {
    const url = `${this.config.baseUrl}/lectures`
    const params = { year, semester }

    try {
      const response = await this.httpClient.get(url, { params }).toPromise()
      return this.parseLectures(response.data)
    } catch (error) {
      throw new ScholarApiException('Failed to fetch lectures', error)
    }
  }
}
```

#### Domain Models

```typescript
// apps/scholar-sync/src/common/domain/DegreeInfo.ts
export interface DegreeInfo {
  code: string
  name: string
  nameEn: string
  department: Department
}

export interface Lecture {
  id: string
  code: string
  title: string
  titleEn: string
  professor: string[]
  department: DegreeInfo
  credit: number
  semester: Semester
  enrolledCount: number
  capacity: number
  classTime: ClassTime[]
}
```

#### Event Publishing

```typescript
// Publish to RabbitMQ
await this.rabbitService.publish(
  QueueSymbols.SCHOLAR_SYNC,
  {
    type: EVENT_TYPE.LECTURE_TITLE,
    lectureId: lecture.id,
    oldTitle: oldLecture.title,
    newTitle: lecture.title,
    timestamp: new Date().toISOString()
  }
)
```

---

### 3. Notification-Consumer (Push Notification Worker)

**Service Type**: RabbitMQ Consumer
**Concurrency**: Multiple worker instances
**Message Queue**: FCM notification queues

#### Responsibilities

1. **Message Consumption**
   - Listen to RabbitMQ notification queues
   - Deserialize notification payloads
   - Validate message schemas

2. **User Preference Checking**
   - Query user agreement settings
   - Filter based on notification type
   - Respect time-based restrictions (night-time ads)

3. **FCM Delivery**
   - Send push notifications via Firebase
   - Handle FCM token invalidation
   - Retry failed deliveries

4. **Error Handling**
   - Dead letter queue for failed messages
   - Log delivery failures
   - Update notification status

#### Queue Structure

```typescript
// RabbitMQ Queue Configuration
export enum QueueSymbols {
  NOTI_FCM = 'noti.fcm',                    // General notifications
  NOTI_INFO_FCM = 'noti.info.fcm',          // Info notifications
  NOTI_AD_FCM = 'noti.ad.fcm',              // Ad notifications
  NOTI_NIGHT_AD_FCM = 'noti.night.ad.fcm'   // Night-time ads
}
```

#### Message Handler

```typescript
// apps/notification-consumer/src/app.controller.ts
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @RabbitSubscribe({
    exchange: 'otl-exchange',
    routingKey: 'noti.fcm',
    queue: 'noti.fcm.queue',
    queueOptions: {
      durable: true,
      deadLetterExchange: 'otl-exchange-dlx',
      messageTtl: 86400000  // 24 hours
    },
    errorHandler: defaultNackErrorHandler
  })
  async handleNotification(
    msg: FCMNotificationRequest,
    amqpMsg: ConsumeMessage
  ) {
    return this.appService.handleNotification(msg, amqpMsg)
  }
}
```

#### Notification Processing Flow

```
RabbitMQ Queue
    ↓
Consumer receives message
    ↓
[1] Deserialize payload
    ↓
[2] Check user agreement
    ├── Query user_agreement table
    ├── Check notification type consent
    └── Check time restrictions (for ads)
    ↓
[3] Retrieve FCM token
    ├── Query user_device table
    └── Validate token expiry
    ↓
[4] Send to Firebase
    ├── Build FCM payload
    ├── Call Firebase Admin SDK
    └── Handle response
    ↓
[5] Update status
    ├── Log delivery result
    ├── Update notification_log table
    └── ACK/NACK message
    ↓
Complete
```

#### FCM Integration

```typescript
// apps/notification-consumer/src/app.service.ts
export class AppService {
  async handleNotification(
    request: FCMNotificationRequest,
    amqpMsg: ConsumeMessage
  ): Promise<void> {
    // Check user consent
    const hasConsent = await this.checkUserAgreement(
      request.userId,
      request.notificationType
    )

    if (!hasConsent) {
      logger.info(`User ${request.userId} has not consented to ${request.notificationType}`)
      return // ACK without sending
    }

    // Get FCM token
    const fcmToken = await this.getFCMToken(request.userId)

    if (!fcmToken) {
      logger.warn(`No FCM token for user ${request.userId}`)
      return
    }

    // Send notification
    try {
      await this.firebaseAdmin.messaging().send({
        token: fcmToken,
        notification: {
          title: request.title,
          body: request.body
        },
        data: request.data,
        android: { priority: 'high' },
        apns: { payload: { aps: { sound: 'default' } } }
      })

      logger.info(`Notification sent to user ${request.userId}`)
    } catch (error) {
      logger.error(`Failed to send notification: ${error.message}`)
      throw error // NACK and requeue
    }
  }
}
```

---

### 4. Server-Consumer (Internal Event Worker)

**Service Type**: RabbitMQ Consumer
**Concurrency**: Prefetch 5 messages
**Timeout**: 30 seconds per message

#### Responsibilities

1. **Statistics Update**
   - Recalculate lecture scores
   - Update course averages
   - Refresh professor ratings
   - Update enrollment counts

2. **Derived Data Calculation**
   - Calculate review aggregates
   - Update like counts
   - Recompute representative lectures
   - Update common lecture titles

3. **Event Processing**
   - Handle synchronous database updates
   - Maintain data consistency
   - Trigger cascading updates

4. **Error Recovery**
   - Retry transient failures
   - Dead letter unprocessable messages
   - Maintain idempotency

#### Queue Structure

```typescript
export enum QueueSymbols {
  SCHOLAR_SYNC = 'scholar.sync',      // Scholar sync events
  STATISTICS = 'statistics.update'    // Statistics events
}

export enum EVENT_TYPE {
  LECTURE_TITLE = 'lecture.title',
  LECTURE_SCORE = 'lecture.score',
  LECTURE_NUM_PEOPLE = 'lecture.num_people',
  COURSE_SCORE = 'course.score',
  COURSE_REPRESENTATIVE_LECTURE = 'course.representative_lecture',
  PROFESSOR_SCORE = 'professor.score',
  REVIEW_LIKE = 'review.like'
}
```

#### Event Handler

```typescript
// apps/server-consumer/src/app.controller.ts
@Injectable()
export class AppController {
  @RabbitConsumer(QueueSymbols.STATISTICS, {
    prefetch: 5,
    timeout: 30000
  })
  async handleStatisticsMessage(amqpMsg: ConsumeMessage) {
    const msg = JSON.parse(amqpMsg.content.toString())
    const request = plainToInstance(Message, msg)

    switch (request.type) {
      case EVENT_TYPE.LECTURE_SCORE:
        return await this.appService.updateLectureScore(request)

      case EVENT_TYPE.COURSE_SCORE:
        return await this.appService.updateCourseScore(request)

      case EVENT_TYPE.PROFESSOR_SCORE:
        return await this.appService.updateProfessorScore(request)

      case EVENT_TYPE.LECTURE_NUM_PEOPLE:
        return await this.appService.updateLectureNumPeople(request)

      case EVENT_TYPE.REVIEW_LIKE:
        return await this.appService.updateReviewLike(request)

      default:
        throw new Error(`Unknown event type: ${request.type}`)
    }
  }
}
```

#### Message Processing Flow

```
RabbitMQ Message
    ↓
Parse JSON payload
    ↓
Validate message type
    ↓
Route to appropriate handler
    ↓
Begin database transaction
    ↓
[1] Read current state
    ↓
[2] Calculate new values
    ├── Aggregate reviews
    ├── Calculate averages
    └── Update counters
    ↓
[3] Update database
    ├── Update primary record
    └── Update related records
    ↓
Commit transaction
    ↓
ACK message
    ↓
Complete
```

#### Example: Lecture Score Update

```typescript
// apps/server-consumer/src/app.service.ts
async updateLectureScore(msg: LectureScoreUpdateMessage) {
  const { lectureId } = msg

  return await this.prisma.$transaction(async (tx) => {
    // 1. Get all reviews for this lecture
    const reviews = await tx.subject_review.findMany({
      where: { lecture: { id: lectureId } }
    })

    // 2. Calculate aggregate scores
    const totalGrade = reviews.reduce((sum, r) => sum + r.grade, 0)
    const totalLoad = reviews.reduce((sum, r) => sum + r.load, 0)
    const totalSpeech = reviews.reduce((sum, r) => sum + r.speech, 0)

    const count = reviews.length

    // 3. Update lecture record
    await tx.subject_lecture.update({
      where: { id: lectureId },
      data: {
        grade: count > 0 ? totalGrade / count : 0,
        load: count > 0 ? totalLoad / count : 0,
        speech: count > 0 ? totalSpeech / count : 0,
        review_total_weight: count
      }
    })

    // 4. Update related course score
    await this.updateCourseScoreForLecture(tx, lectureId)
  })
}
```

---

## Shared Libraries

### 1. prisma-client (Data Access Layer)

#### Purpose
Centralized database access layer with type-safe query builders, repository pattern, and transaction management.

#### Structure

```
libs/prisma-client/src/
├── schema.prisma                    # Prisma schema definition
├── migrations/                      # Database migrations
│   ├── 20260211000000_add_enrolled_count/
│   │   └── migration.sql
│   └── ...
├── repositories/                    # Repository pattern implementations
│   ├── lecture.repository.ts
│   ├── course.repository.ts
│   ├── user.repository.ts
│   ├── review.repository.ts
│   ├── timetable.repository.ts
│   └── sync.repository.ts
├── types/                          # Type definitions
│   └── query.ts
├── prisma.module.ts                # NestJS module
├── prisma.service.ts               # Prisma client service
└── index.ts                        # Public exports
```

#### Database Schema Overview

**Core Entities:**
- `auth_user`: User accounts (legacy Django model)
- `subject_course`: Course information (e.g., CS101)
- `subject_lecture`: Specific lecture offerings
- `subject_review`: User reviews
- `timetable_timetable`: User timetables
- `subject_professor`: Professor information
- `subject_department`: Department data
- `subject_semester`: Academic semesters

**Relationships:**
```
Course (1:N) Lecture (1:N) Review
       (1:N) Lecture (N:M) Timetable
Lecture (N:1) Professor
Lecture (N:1) Department
Lecture (N:1) Semester
```

#### Prisma Service

```typescript
// libs/prisma-client/src/prisma.service.ts
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor(
    @Inject('PRISMA_OPTIONS') private options: PrismaOptions
  ) {
    super({
      datasources: {
        db: {
          url: options.url
        }
      },
      log: [
        { level: 'query', emit: 'event' },
        { level: 'error', emit: 'stdout' },
        { level: 'warn', emit: 'stdout' }
      ]
    })
  }

  async onModuleInit() {
    await this.$connect()

    // Log slow queries
    this.$on('query', (e) => {
      if (e.duration > 1000) {
        logger.warn(`Slow query detected: ${e.query} (${e.duration}ms)`)
      }
    })
  }

  async onModuleDestroy() {
    await this.$disconnect()
  }
}
```

#### Repository Pattern

```typescript
// libs/prisma-client/src/repositories/lecture.repository.ts
export class LectureRepository {
  constructor(private prisma: PrismaService) {}

  async findById(id: number): Promise<Lecture | null> {
    return this.prisma.subject_lecture.findUnique({
      where: { id },
      include: {
        subject_course: true,
        subject_department: true,
        subject_professor: true
      }
    })
  }

  async findBySemester(
    year: number,
    semester: number,
    options?: QueryOptions
  ): Promise<Lecture[]> {
    return this.prisma.subject_lecture.findMany({
      where: {
        year,
        semester
      },
      include: options?.include,
      orderBy: options?.orderBy,
      skip: options?.skip,
      take: options?.take
    })
  }

  async updateScore(id: number, scores: LectureScore): Promise<void> {
    await this.prisma.subject_lecture.update({
      where: { id },
      data: {
        grade: scores.grade,
        load: scores.load,
        speech: scores.speech,
        review_total_weight: scores.reviewCount
      }
    })
  }
}
```

#### Transaction Management (CLS)

```typescript
// Using CLS (Continuation-Local Storage) for transactions
import { Transactional } from '@nestjs-cls/transactional'

export class ReviewService {
  constructor(
    private prisma: PrismaService,
    private lectureRepo: LectureRepository
  ) {}

  @Transactional()
  async createReview(userId: number, data: CreateReviewDto) {
    // All operations within this method share the same transaction

    // 1. Create review
    const review = await this.prisma.subject_review.create({
      data: {
        user_id: userId,
        lecture_id: data.lectureId,
        content: data.content,
        grade: data.grade,
        load: data.load,
        speech: data.speech
      }
    })

    // 2. Update lecture score (within same transaction)
    await this.lectureRepo.updateScore(data.lectureId, {
      /* calculated scores */
    })

    // 3. Publish event (outside transaction)
    await this.eventBus.publish(new ReviewCreatedEvent(review.id))

    return review
  }
}
```

#### Read Replica Support

```typescript
// Prisma extension for read replicas
import { readReplicas } from '@prisma/extension-read-replicas'

const prisma = new PrismaClient().$extends(
  readReplicas({
    url: [
      process.env.DATABASE_REPLICA_1_URL,
      process.env.DATABASE_REPLICA_2_URL
    ]
  })
)

// Read operations automatically use replicas
const lectures = await prisma.subject_lecture.findMany({ ... })

// Write operations use primary
await prisma.subject_lecture.create({ ... })
```

---

### 2. common (Shared Utilities)

#### Purpose
Cross-cutting concerns, utilities, and shared types used across all applications.

#### Structure

```
libs/common/src/
├── logger/
│   ├── logger.ts                   # Winston logger configuration
│   └── logging.interceptor.ts      # Request/response logging
├── exception/
│   ├── exception.filter.ts         # Global exception filters
│   └── http-exception.ts           # Custom HTTP exceptions
├── enum/
│   ├── agreement.ts                # Agreement types
│   ├── semester.ts                 # Semester enums
│   └── ...
├── interfaces/
│   ├── ILecture.ts                 # Lecture interface
│   ├── ICourse.ts                  # Course interface
│   └── ...
├── serializer/
│   ├── lecture.serializer.ts       # DTO serializers
│   └── ...
├── decorator/
│   └── ...                         # Custom decorators
└── index.ts                        # Public exports
```

#### Winston Logger

```typescript
// libs/common/src/logger/logger.ts
import winston from 'winston'
import DailyRotateFile from 'winston-daily-rotate-file'

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: {
    service: 'otl-server',
    environment: process.env.NODE_ENV
  },
  transports: [
    // Console transport for development
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),

    // Daily rotate file transport
    new DailyRotateFile({
      filename: 'logs/application-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d',
      level: 'info'
    }),

    // Error log file
    new DailyRotateFile({
      filename: 'logs/error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '30d',
      level: 'error'
    })
  ]
})

export default logger
```

#### Exception Filter

```typescript
// libs/common/src/exception/exception.filter.ts
@Catch()
export class UnexpectedExceptionFilter implements ExceptionFilter {
  catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse()
    const request = ctx.getRequest()

    const status = exception instanceof HttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR

    const message = exception.message || 'Internal server error'

    // Log error
    logger.error({
      message: exception.message,
      stack: exception.stack,
      path: request.url,
      method: request.method,
      userId: request.user?.id
    })

    // Send to Sentry
    Sentry.captureException(exception)

    // Return error response
    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message
    })
  }
}
```

#### Logging Interceptor

```typescript
// libs/common/src/logger/logging.interceptor.ts
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest()
    const { method, url, body, user } = request
    const startTime = Date.now()

    logger.info(`→ ${method} ${url}`, {
      userId: user?.id,
      body: this.sanitizeBody(body)
    })

    return next.handle().pipe(
      tap((data) => {
        const duration = Date.now() - startTime
        logger.info(`← ${method} ${url} [${duration}ms]`, {
          userId: user?.id,
          duration
        })
      }),
      catchError((error) => {
        const duration = Date.now() - startTime
        logger.error(`✗ ${method} ${url} [${duration}ms]`, {
          userId: user?.id,
          error: error.message,
          duration
        })
        throw error
      })
    )
  }

  private sanitizeBody(body: any): any {
    // Remove sensitive fields
    const sanitized = { ...body }
    delete sanitized.password
    delete sanitized.token
    return sanitized
  }
}
```

---

### 3. rmq (RabbitMQ Integration)

#### Purpose
RabbitMQ connection management, queue definitions, and message handling utilities.

#### Structure

```
libs/rmq/src/
├── rmq.module.ts                   # RabbitMQ module configuration
├── settings.ts                     # Queue and exchange configuration
├── decorator/
│   └── rabbit-consumer.decorator.ts  # Custom consumer decorator
└── index.ts                        # Public exports
```

#### Queue Configuration

```typescript
// libs/rmq/src/settings.ts
export enum QueueSymbols {
  // Scholar sync events
  SCHOLAR_SYNC = 'scholar.sync',

  // Statistics events
  STATISTICS = 'statistics.update',

  // Notification queues
  NOTI_FCM = 'noti.fcm',
  NOTI_INFO_FCM = 'noti.info.fcm',
  NOTI_AD_FCM = 'noti.ad.fcm',
  NOTI_NIGHT_AD_FCM = 'noti.night.ad.fcm'
}

export const getRabbitMQConfig = () => ({
  uri: process.env.RABBITMQ_URL,
  exchanges: [
    {
      name: 'otl-exchange',
      type: 'topic',
      options: { durable: true }
    },
    {
      name: 'otl-exchange-dlx',  // Dead Letter Exchange
      type: 'topic',
      options: { durable: true }
    }
  ],
  queueConfig: {
    [QueueSymbols.SCHOLAR_SYNC]: {
      exchange: 'otl-exchange',
      routingKey: 'scholar.sync.#',
      queue: 'scholar.sync.queue',
      queueOptions: {
        durable: true,
        deadLetterExchange: 'otl-exchange-dlx',
        messageTtl: 86400000  // 24 hours
      }
    },
    [QueueSymbols.STATISTICS]: {
      exchange: 'otl-exchange',
      routingKey: 'statistics.update.#',
      queue: 'statistics.update.queue',
      queueOptions: {
        durable: true,
        deadLetterExchange: 'otl-exchange-dlx',
        messageTtl: 86400000
      }
    },
    // ... other queues
  }
})
```

#### RabbitMQ Module

```typescript
// libs/rmq/src/rmq.module.ts
@Module({})
export class RmqModule {
  static forRoot(): DynamicModule {
    const config = getRabbitMQConfig()

    return {
      module: RmqModule,
      imports: [
        RabbitMQModule.forRoot(RabbitMQModule, {
          uri: config.uri,
          exchanges: config.exchanges,
          connectionInitOptions: {
            wait: true,
            timeout: 30000,
            reject: true
          },
          connectionManagerOptions: {
            heartbeatIntervalInSeconds: 15,
            reconnectTimeInSeconds: 30
          }
        })
      ],
      exports: [RabbitMQModule]
    }
  }
}
```

#### Custom Consumer Decorator

```typescript
// libs/rmq/src/decorator/rabbit-consumer.decorator.ts
export function RabbitConsumer(
  queueSymbol: QueueSymbols,
  options?: ConsumerOptions
) {
  const config = getRabbitMQConfig().queueConfig[queueSymbol]

  return RabbitSubscribe({
    ...config,
    queueOptions: {
      ...config.queueOptions,
      prefetchCount: options?.prefetch || 1
    },
    errorHandler: defaultNackErrorHandler
  })
}
```

---

### 4. redis (Cache Layer)

#### Purpose
Redis connection management and caching utilities.

#### Structure

```
libs/redis/src/
├── redis.module.ts                 # Redis module configuration
├── redis.service.ts                # Redis service wrapper
└── index.ts                        # Public exports
```

#### Redis Module

```typescript
// libs/redis/src/redis.module.ts
@Module({})
export class RedisModule {
  static forRoot(): DynamicModule {
    return {
      module: RedisModule,
      imports: [
        IoredisModule.forRoot({
          config: {
            host: process.env.REDIS_HOST,
            port: parseInt(process.env.REDIS_PORT),
            password: process.env.REDIS_PASSWORD,
            db: 0,
            keyPrefix: 'otl:',
            retryStrategy(times: number) {
              const delay = Math.min(times * 50, 2000)
              return delay
            }
          }
        })
      ],
      providers: [RedisService],
      exports: [RedisService]
    }
  }
}
```

---

## Message Queue Architecture

### Queue Topology

```
Producer                Exchange             Queue                Consumer
────────────────────────────────────────────────────────────────────────────

[Server API]     ──→  [otl-exchange]  ──→  [noti.fcm.queue]  ──→  [Notification Consumer]
                       (topic)               (durable)
                           │                      │
                           │                      └──(DLX)──→ [noti.fcm.dlq]
                           │
                           ├──→  [noti.info.fcm.queue]  ──→  [Notification Consumer]
                           │     (durable)
                           │
                           ├──→  [noti.ad.fcm.queue]  ──→  [Notification Consumer]
                           │     (durable)
                           │
                           └──→  [noti.night.ad.fcm.queue]  ──→  [Notification Consumer]
                                 (durable)

[Scholar Sync]   ──→  [otl-exchange]  ──→  [scholar.sync.queue]  ──→  [Server Consumer]
                       (topic)               (durable)
                                                  │
                                                  └──(DLX)──→ [scholar.sync.dlq]

[Server API]     ──→  [otl-exchange]  ──→  [statistics.update.queue]  ──→  [Server Consumer]
                       (topic)               (durable)
                                                  │
                                                  └──(DLX)──→ [statistics.update.dlq]
```

### Message Flow Patterns

#### 1. Notification Flow

```
User Action (e.g., review like)
    ↓
Server API validates request
    ↓
Server updates database
    ↓
Server publishes to RabbitMQ
    {
      exchange: 'otl-exchange',
      routingKey: 'noti.fcm.review.like',
      message: {
        userId: 123,
        notificationType: 'review_like',
        title: 'Your review received a like',
        body: 'Someone liked your CS101 review',
        data: { reviewId: 456, lectureId: 789 }
      }
    }
    ↓
RabbitMQ routes to noti.fcm.queue
    ↓
Notification Consumer picks up message
    ↓
Check user agreements
    ↓
Send FCM notification
    ↓
ACK message
```

#### 2. Statistics Update Flow

```
User posts review
    ↓
Server API creates review record
    ↓
Server publishes to RabbitMQ
    {
      exchange: 'otl-exchange',
      routingKey: 'statistics.update.lecture.score',
      message: {
        type: 'LECTURE_SCORE',
        lectureId: 789,
        timestamp: '2026-02-11T10:30:00Z'
      }
    }
    ↓
RabbitMQ routes to statistics.update.queue
    ↓
Server Consumer picks up message
    ↓
Recalculate lecture scores
    ↓
Update database
    ↓
ACK message
```

#### 3. Scholar Sync Flow

```
Scholar Sync scheduled job runs
    ↓
Fetch data from Scholar API
    ↓
Compare with database
    ↓
Update database records
    ↓
For each changed lecture, publish event
    {
      exchange: 'otl-exchange',
      routingKey: 'scholar.sync.lecture.title',
      message: {
        type: 'LECTURE_TITLE',
        lectureId: 789,
        oldTitle: 'Introduction to Programming',
        newTitle: 'Programming Fundamentals',
        timestamp: '2026-02-11T10:30:00Z'
      }
    }
    ↓
Server Consumer picks up message
    ↓
Update derived data (lecture.common_title)
    ↓
ACK message
```

### Error Handling & Retries

#### Dead Letter Exchange (DLX)

```typescript
// Queue configuration with DLX
{
  queue: 'noti.fcm.queue',
  queueOptions: {
    durable: true,
    deadLetterExchange: 'otl-exchange-dlx',
    deadLetterRoutingKey: 'dlq.noti.fcm',
    messageTtl: 86400000  // 24 hours
  }
}
```

#### Retry Logic

```typescript
// Consumer with retry
@RabbitSubscribe({ ... })
async handleMessage(msg: Message, amqpMsg: ConsumeMessage) {
  const retryCount = amqpMsg.properties.headers['x-retry-count'] || 0
  const maxRetries = 3

  try {
    await this.processMessage(msg)
  } catch (error) {
    if (retryCount < maxRetries) {
      // Republish with incremented retry count
      await this.rabbitService.publish({
        exchange: 'otl-exchange',
        routingKey: amqpMsg.fields.routingKey,
        message: msg,
        options: {
          headers: {
            'x-retry-count': retryCount + 1
          }
        }
      })
    } else {
      // Max retries exceeded, send to DLQ
      logger.error(`Max retries exceeded for message: ${JSON.stringify(msg)}`)
      // Message will be automatically sent to DLX by RabbitMQ
    }
    throw error // NACK
  }
}
```

---

## Caching Strategy

### Cache Layers

```
Client Request
    ↓
[1] Application Cache (Redis)
    ├── Key: otl:lectures:semester:2024:1
    ├── TTL: 1 hour
    └── Hit → Return cached data
    │
    └── Miss ↓
        [2] Database Query (MariaDB)
            ├── Query lectures table
            ├── Join related tables
            └── Return fresh data
                ↓
                Cache result in Redis
                ↓
                Return to client
```

### Cache Key Patterns

```typescript
// Cache key conventions
export const CacheKeys = {
  // Lectures
  lecture: (id: number) => `otl:lecture:${id}`,
  lecturesBySemester: (year: number, semester: number) =>
    `otl:lectures:semester:${year}:${semester}`,

  // Courses
  course: (id: number) => `otl:course:${id}`,
  courses: () => 'otl:courses:all',

  // User
  user: (id: number) => `otl:user:${id}`,
  userTimetables: (userId: number) => `otl:user:${userId}:timetables`,

  // Statistics
  lectureStats: (id: number) => `otl:lecture:${id}:stats`,
  courseStats: (id: number) => `otl:course:${id}:stats`
}
```

### Cache Implementation

```typescript
// Using NestJS Cache Manager
@Injectable()
export class LectureService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private lectureRepo: LectureRepository
  ) {}

  async getLecture(id: number): Promise<Lecture> {
    const cacheKey = CacheKeys.lecture(id)

    // Try cache first
    const cached = await this.cacheManager.get<Lecture>(cacheKey)
    if (cached) {
      return cached
    }

    // Cache miss - fetch from database
    const lecture = await this.lectureRepo.findById(id)

    if (lecture) {
      // Cache for 1 hour
      await this.cacheManager.set(cacheKey, lecture, 3600)
    }

    return lecture
  }

  async invalidateLectureCache(id: number): Promise<void> {
    const cacheKey = CacheKeys.lecture(id)
    await this.cacheManager.del(cacheKey)
  }
}
```

### Cache Invalidation Strategies

#### 1. Time-Based (TTL)
```typescript
// Set TTL based on data volatility
await cache.set(key, value, {
  ttl: 3600  // 1 hour for frequently changing data
})

await cache.set(key, value, {
  ttl: 86400  // 24 hours for static data
})
```

#### 2. Event-Based
```typescript
// Invalidate when data changes
@Transactional()
async updateLecture(id: number, data: UpdateLectureDto) {
  // Update database
  const lecture = await this.prisma.lecture.update({ ... })

  // Invalidate cache
  await this.cacheManager.del(CacheKeys.lecture(id))
  await this.cacheManager.del(CacheKeys.lecturesBySemester(
    lecture.year,
    lecture.semester
  ))

  return lecture
}
```

#### 3. Lazy Invalidation
```typescript
// Store version with cached data
interface CachedData<T> {
  data: T
  version: number
  timestamp: number
}

// On write, increment version
await redis.incr('otl:lecture:version')

// On read, compare versions
const cachedVersion = cached.version
const currentVersion = await redis.get('otl:lecture:version')

if (cachedVersion < currentVersion) {
  // Cache is stale, refresh
}
```

---

## Authentication & Authorization

### Authentication Flow

```
Client sends credentials
    ↓
[1] Login Request
    POST /api/v1/session/login
    Body: { username, password }
    ↓
[2] Server validates credentials
    ├── Query user from database
    ├── Compare bcrypt hashed password
    └── Check user is_active flag
    ↓
[3] Generate JWT token
    {
      sub: userId,
      username: username,
      iat: issuedAt,
      exp: expiresAt
    }
    ↓
[4] Set HTTP-only cookie
    Set-Cookie: access_token=<jwt>; HttpOnly; Secure; SameSite=Strict
    ↓
[5] Return user data
    {
      id: 123,
      username: 'student',
      email: 'student@kaist.ac.kr'
    }
```

### Authorization Guard

```typescript
// apps/server/src/modules/auth/guard/auth.guard.ts
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private authChain: AuthChain) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()

    // Skip auth for public endpoints
    const isPublic = this.reflector.get<boolean>(
      'isPublic',
      context.getHandler()
    )
    if (isPublic) return true

    // Extract token from cookie
    const token = request.cookies?.access_token

    if (!token) {
      throw new UnauthorizedException('No token provided')
    }

    try {
      // Verify JWT
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET
      })

      // Attach user to request
      request.user = payload

      return true
    } catch {
      throw new UnauthorizedException('Invalid token')
    }
  }
}
```

### CSRF Protection

```typescript
// Enabled globally in bootstrap
app.use(csrf({
  cookie: { key: 'csrftoken' },
  ignoreMethods: ['GET', 'HEAD', 'OPTIONS', 'DELETE', 'PATCH', 'PUT', 'POST']
}))

// Client must include CSRF token in requests
// Token is set in cookie by server on first request
```

### Password Hashing

```typescript
import bcrypt from 'bcrypt'

export class AuthService {
  async hashPassword(password: string): Promise<string> {
    const saltRounds = 10
    return bcrypt.hash(password, saltRounds)
  }

  async comparePassword(
    password: string,
    hashedPassword: string
  ): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword)
  }
}
```

---

## API Structure

### RESTful Endpoints

#### Base URLs
- **Production**: `https://otl.kaist.ac.kr/api`
- **Development**: `https://otl.dev.sparcs.org/api`
- **Local**: `http://localhost:8000/api`

#### API Versions
- **v1**: `/api/v1/...` (Legacy, maintained)
- **v2**: `/api/v2/...` (Current, recommended)

### Core API Endpoints

#### Authentication
```
POST   /api/v1/session/login         # User login
POST   /api/v1/session/logout        # User logout
GET    /api/v1/session/info          # Get current user info
```

#### Lectures
```
GET    /api/v1/lectures               # List lectures
GET    /api/v1/lectures/:id           # Get lecture details
GET    /api/v1/lectures/:id/reviews   # Get lecture reviews
POST   /api/v1/lectures/:id/reviews   # Create review
```

#### Courses
```
GET    /api/v1/courses                # List courses
GET    /api/v1/courses/:id            # Get course details
GET    /api/v1/courses/:id/lectures   # Get course lectures
```

#### Timetables (v2)
```
GET    /api/v2/timetables             # List user timetables
POST   /api/v2/timetables             # Create timetable
GET    /api/v2/timetables/:id         # Get timetable
PUT    /api/v2/timetables/:id         # Update timetable
DELETE /api/v2/timetables/:id         # Delete timetable
POST   /api/v2/timetables/:id/lectures       # Add lecture to timetable
DELETE /api/v2/timetables/:id/lectures/:lid  # Remove lecture
```

#### Reviews
```
GET    /api/v1/reviews                # List all reviews
GET    /api/v1/reviews/:id            # Get review details
POST   /api/v1/reviews                # Create review
PUT    /api/v1/reviews/:id            # Update review
DELETE /api/v1/reviews/:id            # Delete review
POST   /api/v1/reviews/:id/like       # Like review
DELETE /api/v1/reviews/:id/like       # Unlike review
```

#### User
```
GET    /api/v1/users/me               # Get current user
PUT    /api/v1/users/me               # Update current user
GET    /api/v1/users/me/reviews       # Get user's reviews
GET    /api/v1/users/me/timetables    # Get user's timetables
```

### OpenAPI Documentation

Swagger documentation is available at `/api-docs` (non-production only).

```typescript
// Generated from NestJS decorators
@ApiTags('lectures')
@Controller('v1/lectures')
export class LecturesController {
  @ApiOperation({ summary: 'Get lecture by ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Lecture details',
    type: LectureDto
  })
  @ApiResponse({ status: 404, description: 'Lecture not found' })
  @Get(':id')
  async getLecture(@Param('id') id: number): Promise<LectureDto> {
    return this.lectureService.findById(id)
  }
}
```

---

## Deployment Architecture

### Environment Profiles

| Environment | Purpose | Database | Cache | MQ | Monitoring |
|-------------|---------|----------|-------|-----|------------|
| **Local** | Development | Local MySQL | Local Redis | Local RabbitMQ | Console logs |
| **Dev** | Testing | Dev RDS | Dev ElastiCache | Dev MQ | Sentry (dev) |
| **Prod** | Production | Prod RDS | Prod ElastiCache | Prod MQ | Sentry (prod) |

### Docker Deployment

#### Build Process

```bash
# 1. Build Docker image
docker build -f deploy/server/docker/Dockerfile.server -t otlplus-server:latest .

# 2. Run container
docker run -d \
  --name otlplus-server \
  -p 8000:8000 \
  -e NODE_ENV=prod \
  -v /var/log/otl:/var/www/otlplus-server/logs \
  otlplus-server:latest
```

#### Docker Compose (Production)

```yaml
# deploy/server/docker/docker-compose.prod.yml
version: '3.4'

services:
  server:
    image: otlplus-server:latest
    container_name: otlplus-server
    platform: linux/amd64
    restart: always
    ports:
      - "8000:8000"
      - "9209:9209"  # Prometheus metrics
    environment:
      - NODE_ENV=prod
      - DOCKER_DEPLOY=true
    env_file:
      - ../../../env/.env.prod
    volumes:
      - /etc/timezone:/etc/timezone:ro
      - ./logs:/var/www/otlplus-server/logs
    command: pm2-runtime start ecosystem.config.js --only @otl/server-nest --node-args="max-old-space-size=40920"
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/api/v1/status/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

### PM2 Configuration

```javascript
// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: '@otl/server-nest',
      script: './dist/apps/server/apps/server/src/bootstrap/bootstrap.js',
      instances: 'max',  // Use all CPU cores
      exec_mode: 'cluster',
      max_memory_restart: '40G',
      env: {
        NODE_ENV: 'production',
        PORT: 8000
      },
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      merge_logs: true,
      autorestart: true,
      watch: false,
      max_restarts: 10,
      min_uptime: '10s'
    }
  ]
}
```

### Health Checks

```typescript
// apps/server/src/modules/status/status.controller.ts
@Controller('status')
export class StatusController {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
    private health: HealthCheckService
  ) {}

  @Get('health')
  @HealthCheck()
  check() {
    return this.health.check([
      // Database health
      async () => this.prisma.$queryRaw`SELECT 1`,

      // Redis health
      async () => this.redis.ping(),

      // Disk space
      async () => this.health.checkDiskSpace('disk', {
        thresholdPercent: 0.9
      }),

      // Memory
      async () => this.health.checkMemory('memory', {
        heapUsedThreshold: 38 * 1024 * 1024 * 1024  // 38GB
      })
    ])
  }
}
```

---

## Development Workflow

### Local Setup

```bash
# 1. Clone repository
git clone https://github.com/sparcs-kaist/otlplus-server.git
cd otlplus-server

# 2. Install Node.js v20
nvm install 20
nvm use 20

# 3. Install dependencies
yarn install

# 4. Setup environment
cp env/.env.example env/.env.local
# Edit env/.env.local with your configuration

# 5. Start infrastructure services
docker compose up -d  # Starts MySQL, Redis, RabbitMQ

# 6. Generate Prisma client
yarn client:generate

# 7. Run migrations
yarn migrate:local

# 8. Start development server
yarn start:server:local
```

### Development Commands

```bash
# Build all apps
yarn build:all

# Build specific app
yarn build:server
yarn build:scholar-sync
yarn build:notification-consumer
yarn build:server-consumer

# Start in development mode (with watch)
yarn start:server:local          # Server
yarn start:scholar-sync:local    # Scholar Sync
yarn start:notification-consumer:local
yarn start:server-consumer:local

# Database management
yarn migrate:create:local        # Create new migration
yarn migrate:local              # Apply migrations
yarn migrate:status:local       # Check migration status
yarn db:push                    # Push schema changes (dev only)
yarn client:generate            # Regenerate Prisma client

# Code quality
yarn lint                       # Run ESLint
yarn lint:fix                   # Fix linting issues
yarn format                     # Format code with Prettier
yarn format:check               # Check formatting

# Testing
yarn test                       # Run unit tests
yarn test:watch                 # Run tests in watch mode
yarn test:cov                   # Generate coverage report
yarn test:e2e                   # Run E2E tests
```

### Git Workflow

```bash
# 1. Create feature branch
git checkout -b feature/add-new-endpoint

# 2. Make changes and commit
git add .
git commit -m "feat: Add new endpoint for lecture statistics"

# 3. Pre-commit hooks run automatically (via Husky)
#    - ESLint
#    - Prettier
#    - Type checking

# 4. Push to remote
git push origin feature/add-new-endpoint

# 5. Create pull request
gh pr create --title "Add lecture statistics endpoint" --body "..."

# 6. CI runs automatically
#    - Linting
#    - Type checking
#    - Unit tests
#    - Build verification

# 7. Code review and merge
```

### Database Migrations

```bash
# Create new migration
yarn migrate:create:local -- --name add_enrolled_count

# This creates:
# libs/prisma-client/src/migrations/20260211000000_add_enrolled_count/
#   └── migration.sql

# Edit migration.sql
# Then apply:
yarn migrate:local

# Deploy to production
yarn migrate:deploy:prod
```

---

## Testing Strategy

### Test Structure

```
apps/server/src/
├── modules/
│   └── lectures/
│       ├── lectures.service.ts
│       ├── lectures.service.spec.ts      # Unit tests
│       ├── lectures.controller.ts
│       └── lectures.controller.spec.ts   # Unit tests
test/
├── e2e/
│   ├── lectures.e2e-spec.ts              # E2E tests
│   └── auth.e2e-spec.ts
└── jest-e2e.json
```

### Unit Tests

```typescript
// apps/server/src/modules/lectures/lectures.service.spec.ts
describe('LecturesService', () => {
  let service: LecturesService
  let prisma: PrismaService

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        LecturesService,
        {
          provide: PrismaService,
          useValue: {
            subject_lecture: {
              findUnique: jest.fn(),
              findMany: jest.fn(),
              create: jest.fn()
            }
          }
        }
      ]
    }).compile()

    service = module.get<LecturesService>(LecturesService)
    prisma = module.get<PrismaService>(PrismaService)
  })

  describe('findById', () => {
    it('should return lecture when found', async () => {
      const mockLecture = {
        id: 1,
        code: 'CS101',
        title: 'Introduction to Programming'
      }

      jest.spyOn(prisma.subject_lecture, 'findUnique')
        .mockResolvedValue(mockLecture)

      const result = await service.findById(1)

      expect(result).toEqual(mockLecture)
      expect(prisma.subject_lecture.findUnique).toHaveBeenCalledWith({
        where: { id: 1 }
      })
    })

    it('should throw NotFoundException when not found', async () => {
      jest.spyOn(prisma.subject_lecture, 'findUnique')
        .mockResolvedValue(null)

      await expect(service.findById(999))
        .rejects
        .toThrow(NotFoundException)
    })
  })
})
```

### E2E Tests

```typescript
// test/e2e/lectures.e2e-spec.ts
describe('Lectures API (e2e)', () => {
  let app: INestApplication
  let prisma: PrismaService

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule]
    }).compile()

    app = moduleFixture.createNestApplication()
    prisma = app.get(PrismaService)

    await app.init()
  })

  afterAll(async () => {
    await prisma.$disconnect()
    await app.close()
  })

  describe('GET /api/v1/lectures/:id', () => {
    it('should return lecture details', async () => {
      return request(app.getHttpServer())
        .get('/api/v1/lectures/1')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id')
          expect(res.body).toHaveProperty('code')
          expect(res.body).toHaveProperty('title')
        })
    })

    it('should return 404 for non-existent lecture', async () => {
      return request(app.getHttpServer())
        .get('/api/v1/lectures/999999')
        .expect(404)
    })
  })
})
```

### Test Coverage

```bash
# Run tests with coverage
yarn test:cov

# Coverage thresholds in package.json
{
  "jest": {
    "coverageThresholds": {
      "global": {
        "branches": 70,
        "functions": 70,
        "lines": 70,
        "statements": 70
      }
    }
  }
}
```

---

## Monitoring & Observability

### Error Tracking (Sentry)

```typescript
// Automatic error capture
import * as Sentry from '@sentry/nestjs'

// Initialize in bootstrap
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
  integrations: [
    new Sentry.Integrations.Http({ tracing: true }),
    new Sentry.Integrations.Prisma({ client: prisma })
  ]
})

// Manual error capture
try {
  await riskyOperation()
} catch (error) {
  Sentry.captureException(error, {
    tags: {
      feature: 'lectures',
      operation: 'create'
    },
    extra: {
      userId: user.id,
      lectureId: lecture.id
    }
  })
  throw error
}
```

### Logging

```typescript
// Structured logging with Winston
logger.info('User login successful', {
  userId: user.id,
  ip: request.ip,
  userAgent: request.headers['user-agent']
})

logger.error('Database query failed', {
  error: error.message,
  stack: error.stack,
  query: sql,
  params: params
})
```

### Metrics (Prometheus)

```typescript
// Metrics exposed on port 9209
import promClient from 'prom-client'

// HTTP request duration
const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code']
})

// Database query duration
const dbQueryDuration = new promClient.Histogram({
  name: 'db_query_duration_seconds',
  help: 'Duration of database queries in seconds',
  labelNames: ['operation', 'table']
})

// RabbitMQ message processing
const mqMessageDuration = new promClient.Histogram({
  name: 'mq_message_duration_seconds',
  help: 'Duration of message processing in seconds',
  labelNames: ['queue', 'status']
})
```

---

## Conclusion

This document provides comprehensive technical documentation for the OTL Plus Server. For specific implementation details, refer to the source code and inline comments. For questions or clarifications, consult the development team or create an issue in the GitHub repository.

**Last Updated**: 2026-02-11
**Maintainer**: OTL Plus Development Team
