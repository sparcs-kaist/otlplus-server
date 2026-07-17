import { AgreementType, Prisma } from '@prisma/client'
import { StatusCodes } from 'http-status-codes'
import { promises as fs } from 'node:fs'
import path from 'node:path'

import { NotificationException } from '@otl/common/exception/notification.exception'

import { IPrismaMiddleware } from './middleware/IPrismaMiddleware'
import { buildPostgresDatasourceUrl } from './prisma.config'
import { PrismaService } from './prisma.service'
import { CourseRepository } from './repositories/course.repository'
import { CourseRepositoryV2 } from './repositories/course.v2.repository'
import { LectureRepository } from './repositories/lecture.repository'
import { NotificationPrismaRepository } from './repositories/notification.repository'
import { UserRepository } from './repositories/user.repository'

const migrationsRoot = path.join(process.cwd(), 'libs', 'prisma-client', 'src', 'migrations')
const initMigrationPath = path.join(migrationsRoot, '0_init', 'migration.sql')
const envExamplePath = path.join(process.cwd(), 'env', '.env.example')
const reviewRepositoryPath = path.join(
  process.cwd(),
  'libs',
  'prisma-client',
  'src',
  'repositories',
  'review.repository.ts',
)
const dockerComposePath = path.join(process.cwd(), 'deploy', 'server', 'docker', 'docker-compose-db-local.yml')
const initExporterPath = path.join(process.cwd(), 'deploy', 'server', 'docker', 'init-exporter.sql')
const initShadowDatabasePath = path.join(process.cwd(), 'deploy', 'server', 'docker', 'init-shadow-db.sql')
const localSSOSwapPath = path.join(process.cwd(), 'apps', 'server', 'local-SSO-swap.ts')
const rootPackageJsonPath = path.join(process.cwd(), 'package.json')

const getInitMigration = async () => {
  return fs.readFile(initMigrationPath, 'utf8')
}

const getCreateTableBlock = (sql: string, tableName: string) => {
  const escapedTableName = tableName.replace(/"/g, '\\"')
  const tablePattern = new RegExp('CREATE\\s+TABLE\\s+"' + escapedTableName + '"[\\s\\S]*?\\);', 'i')

  return tablePattern.exec(sql)?.[0]
}

const hasGeneratedColumn = (tableSql: string, columnName: string) => {
  const escapedColumnName = columnName.replace(/"/g, '\\"')
  const pattern = new RegExp(
    '"' + escapedColumnName + '"[^\\n]*GENERATED\\s+ALWAYS\\s+AS\\s*\\([\\s\\S]*?\\)\\s+STORED',
    'i',
  )

  return {
    match: pattern.test(tableSql),
    pattern,
  }
}

const getActiveMigrationDirectories = async () => {
  const entries = await fs.readdir(migrationsRoot, { withFileTypes: true })

  return entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort()
}

const getActiveMigrationSqlFiles = async () => {
  const migrationDirectories = await getActiveMigrationDirectories()
  const migrationSqlFiles = await Promise.all(
    migrationDirectories.map(async (directory) => {
      const migrationPath = path.join(migrationsRoot, directory)
      const entries = await fs.readdir(migrationPath, { withFileTypes: true })

      return entries
        .filter((entry) => entry.isFile() && entry.name.endsWith('.sql'))
        .map((entry) => path.join(migrationPath, entry.name))
    }),
  )

  return migrationSqlFiles.flat().sort()
}

const mysqlOnlyMarkers = [
  { label: 'backtick-quoted identifiers', pattern: /`/ },
  { label: 'AUTO_INCREMENT', pattern: /AUTO_INCREMENT/i },
  { label: 'CHARACTER SET', pattern: /CHARACTER\s+SET/i },
  { label: 'utf8mb4', pattern: /utf8mb4/i },
  { label: 'LONGTEXT', pattern: /LONGTEXT/i },
  { label: 'MEDIUMTEXT', pattern: /MEDIUMTEXT/i },
  { label: 'MODIFY COLUMN', pattern: /MODIFY\s+COLUMN/i },
  { label: 'MODIFY', pattern: /\bMODIFY\b/i },
  { label: 'DROP FOREIGN KEY', pattern: /DROP\s+FOREIGN\s+KEY/i },
  { label: 'ENGINE', pattern: /\bENGINE\s*=/i },
  { label: 'UNSIGNED', pattern: /\bUNSIGNED\b/i },
  { label: 'DATETIME', pattern: /\bDATETIME\b/i },
  { label: 'COLLATE', pattern: /\bCOLLATE\b/i },
]

describe('PostgreSQL Prisma migration smoke tests', () => {
  it('constructs PrismaService without a MariaDB adapter', async () => {
    const prisma = new PrismaService()

    expect(prisma.constructor.name).toBe('PrismaService')
    expect(typeof prisma.$connect).toBe('function')
    expect(typeof prisma.$disconnect).toBe('function')

    await prisma.$disconnect()
  })

  it('builds a PostgreSQL datasource URL from legacy DATABASE_* settings', () => {
    expect(
      buildPostgresDatasourceUrl({
        host: 'localhost',
        port: 5432,
        user: 'otlplus',
        password: 'pass word',
        database: 'otlplus_test',
        connectionLimit: 10,
      }),
    ).toBe('postgresql://otlplus:pass%20word@localhost:5432/otlplus_test?connection_limit=10')
  })

  it('Given an unbracketed IPv6 host, when building a PostgreSQL datasource URL, then hostname and port are parseable', () => {
    const datasourceUrl = buildPostgresDatasourceUrl({
      host: '2001:db8::1',
      port: 5432,
      user: 'otlplus',
      password: 'pass word',
      database: 'otlplus_test',
      connectionLimit: 10,
    })

    expect(datasourceUrl).toBeDefined()
    if (datasourceUrl === undefined) {
      throw new Error('Expected buildPostgresDatasourceUrl to return a PostgreSQL URL')
    }

    const parsedUrl = new URL(datasourceUrl)

    expect(parsedUrl.protocol).toBe('postgresql:')
    expect(parsedUrl.host).toBe('[2001:db8::1]:5432')
    expect(parsedUrl.hostname).toBe('[2001:db8::1]')
    expect(parsedUrl.pathname).toBe('/otlplus_test')
    expect(parsedUrl.port).toBe('5432')
    expect(parsedUrl.searchParams.get('connection_limit')).toBe('10')
  })

  it('Given a complete PostgreSQL URL, when connection_limit is absent, then service-specific limit is applied while preserving existing query parameters', () => {
    const datasourceUrl = buildPostgresDatasourceUrl({
      datasourceUrl: 'postgresql://seed-user:seed-pass@seed-host.example.com:5432/seed_db?sslmode=prefer&schema=public',
      connectionLimit: 40,
      host: 'unused',
      user: 'unused',
      database: 'unused',
    })

    expect(datasourceUrl).toBeDefined()
    if (datasourceUrl === undefined) {
      throw new Error('Expected buildPostgresDatasourceUrl to return a PostgreSQL URL')
    }

    const parsedUrl = new URL(datasourceUrl)

    expect(parsedUrl.searchParams.get('connection_limit')).toBe('40')
    expect(parsedUrl.searchParams.get('sslmode')).toBe('prefer')
    expect(parsedUrl.searchParams.get('schema')).toBe('public')
  })

  it('Given a PostgreSQL URL already carrying connection_limit, when buildPostgresDatasourceUrl is applied, then explicit value is preserved', () => {
    const datasourceUrl = buildPostgresDatasourceUrl({
      datasourceUrl:
        'postgresql://seed-user:seed-pass@seed-host.example.com:5432/seed_db?connection_limit=7&sslmode=prefer',
      connectionLimit: 40,
      host: 'unused',
      user: 'unused',
      database: 'unused',
    })

    expect(datasourceUrl).toBeDefined()
    if (datasourceUrl === undefined) {
      throw new Error('Expected buildPostgresDatasourceUrl to return a PostgreSQL URL')
    }

    const parsedUrl = new URL(datasourceUrl)

    expect(parsedUrl.searchParams.get('connection_limit')).toBe('7')
    expect(parsedUrl.searchParams.get('sslmode')).toBe('prefer')
  })

  it('keeps generated model payload types available for application code', () => {
    const courseWithDepartmentArgs = Prisma.validator<Prisma.subject_courseDefaultArgs>()({
      include: {
        subject_department: true,
      },
    })

    type CourseWithDepartment = Prisma.subject_courseGetPayload<typeof courseWithDepartmentArgs>

    const assertCourseShape = (_course: CourseWithDepartment) => true

    expect(typeof assertCourseShape).toBe('function')
    expect(courseWithDepartmentArgs.include?.subject_department).toBe(true)
  })

  it('accepts PostgreSQL createMany/updateMany returning operations in middleware operation types', () => {
    const operations = ['createManyAndReturn', 'updateManyAndReturn'] satisfies IPrismaMiddleware.operationType[]

    expect(operations).toEqual(['createManyAndReturn', 'updateManyAndReturn'])
  })

  it('Given the migrations directory, when scanning top-level migration folders, then exactly one active migration directory named 0_init exists', async () => {
    const migrationDirectories = await getActiveMigrationDirectories()

    expect(migrationDirectories).toEqual(['0_init'])
  })

  it('Given active PostgreSQL migrations, when scanning SQL files, then MySQL-only markers must be absent', async () => {
    const sqlFiles = await getActiveMigrationSqlFiles()
    const violations: string[] = []

    for (const sqlFile of sqlFiles) {
      const migrationContent = await fs.readFile(sqlFile, 'utf8')

      for (const marker of mysqlOnlyMarkers) {
        if (marker.pattern.test(migrationContent)) {
          violations.push(`${path.relative(process.cwd(), sqlFile)} contains ${marker.label}`)
        }
      }
    }

    expect(violations).toEqual([])
  })

  it('Given migration_lock.toml, when resolved, then provider must be PostgreSQL', async () => {
    const migrationLock = await fs.readFile(path.join(migrationsRoot, 'migration_lock.toml'), 'utf8')
    const providerMatch = migrationLock.match(/^provider\s*=\s*"([^"]+)"\s*$/m)

    expect(providerMatch).not.toBeNull()
    expect(providerMatch?.[1]).toBe('postgresql')
  })

  it('Given env/.env.example, when asserting PostgreSQL local defaults, then mysql defaults and MySQL identifiers are not present', async () => {
    const envExample = await fs.readFile(envExamplePath, 'utf8')
    const activeLines = envExample
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0 && !line.startsWith('#'))

    const databaseUrlLine = activeLines.find((line) => line.startsWith('DATABASE_URL='))

    expect(databaseUrlLine).not.toBeUndefined()

    if (databaseUrlLine === undefined) {
      throw new Error('DATABASE_URL must be set in env/.env.example')
    }

    expect(databaseUrlLine).toMatch(/DATABASE_URL=postgresql:\/\/otlplus:[^@]+@[^:]+:45432\//)
    expect(activeLines).toContain('OTLPLUS_DB_USER=otlplus')
    expect(envExample).not.toContain('mysql://')
    expect(envExample).not.toMatch(/\broot\b/)
    expect(envExample).not.toMatch(/43306/)
  })

  it('Given the future 0_init migration, when checking computed columns, then subject_course and subject_lecture define all required PostgreSQL generated columns', async () => {
    const migrationSql = await getInitMigration()
    const tableChecks = [
      {
        table: 'subject_course',
        tableSql: getCreateTableBlock(migrationSql, 'subject_course'),
        columns: ['title_no_space', 'title_en_no_space', 'level'],
      },
      {
        table: 'subject_lecture',
        tableSql: getCreateTableBlock(migrationSql, 'subject_lecture'),
        columns: ['title_no_space', 'title_en_no_space', 'level'],
      },
    ]

    const violations: string[] = []

    for (const tableCheck of tableChecks) {
      if (tableCheck.tableSql === undefined) {
        violations.push(`table ${tableCheck.table} is missing from 0_init/migration.sql`)
        continue
      }

      for (const column of tableCheck.columns) {
        if (!hasGeneratedColumn(tableCheck.tableSql, column).match) {
          violations.push(`${tableCheck.table}.${column} is not defined as GENERATED ALWAYS AS (...) STORED`)
        }
      }
    }

    expect(violations).toEqual([])
  })

  it('Given review.repository.ts, when scanning raw queries, then RAND() is absent and executable ORDER BY RANDOM() occurrences are exactly 2', async () => {
    const reviewRepositoryContent = await fs.readFile(reviewRepositoryPath, 'utf8')
    const executableSql = reviewRepositoryContent.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')

    const randomCalls = executableSql.match(/ORDER\s+BY\s+RANDOM\s*\(\)/gi) ?? []

    expect(executableSql).not.toMatch(/\bRAND\s*\(/i)
    expect(randomCalls.length).toBe(2)
    expect(executableSql).toMatch(/public\s+async\s+getRandomNHumanityBestReviews[\s\S]*ORDER\s+BY\s+RANDOM\s*\(/i)
    expect(executableSql).toMatch(/public\s+async\s+getRandomNMajorBestReviews[\s\S]*ORDER\s+BY\s+RANDOM\s*\(/i)
  })

  const describePostgresIntegration = process.env.DATABASE_URL ? describe : describe.skip

  describePostgresIntegration(
    'PostgreSQL generated-column integration contracts against a live migrated database',
    () => {
      let prisma: PrismaService | undefined
      let searchDepartmentId: number | undefined
      let searchCourseId: number | undefined
      let searchLectureId: number | undefined
      let exactUserId: number | undefined
      let exactNotificationId: number | undefined
      const searchSuffix = `${process.pid}${Date.now()}`.slice(-6)
      const searchCourseTitleEn = `MiXeD Course ${searchSuffix}`
      const searchLectureTitleEn = `LeCtUrE Mixed ${searchSuffix}`
      const searchOldCode = `OlD${searchSuffix}`
      const searchNewCode = `Cs.${searchSuffix}`
      const exactSid = `SiD-${searchSuffix}`
      const exactUid = `UiD-${searchSuffix}`
      const exactStudentId = Number(`8${searchSuffix}`)
      const exactNotificationName = `NoTiFy-${searchSuffix}`

      const getPrisma = () => {
        if (prisma === undefined) {
          throw new Error('PrismaService must be initialized in beforeAll')
        }

        return prisma
      }

      beforeAll(async () => {
        prisma = new PrismaService()
        await prisma.$connect()

        const department = await prisma.subject_department.create({
          data: {
            id: 800000 + Number(searchSuffix),
            num_id: searchSuffix.slice(-4),
            code: `S${searchSuffix.slice(-4)}`,
            name: `Search ${searchSuffix}`,
            name_en: `Search ${searchSuffix} EN`,
            visible: true,
          },
        })
        searchDepartmentId = department.id

        const course = await prisma.subject_course.create({
          data: {
            old_code: searchOldCode,
            department_id: department.id,
            type: 'LECTURE',
            type_en: 'LECTURE',
            title: `검색 회귀 ${searchSuffix}`,
            title_en: searchCourseTitleEn,
            summury: 'Case-insensitive PostgreSQL search regression fixture',
            grade_sum: 0,
            load_sum: 0,
            speech_sum: 0,
            review_total_weight: 0,
            grade: 0,
            load: 0,
            speech: 0,
            new_code: searchNewCode,
            representative_lecture_id: 0,
          },
        })
        searchCourseId = course.id

        const lecture = await prisma.subject_lecture.create({
          data: {
            code: `L${searchSuffix}`,
            old_code: `Lt${searchSuffix}`,
            year: 2026,
            semester: 1,
            department_id: department.id,
            class_no: 'R01',
            title: `강의 검색 ${searchSuffix}`,
            title_en: searchLectureTitleEn,
            type: 'LEC',
            type_en: 'LEC',
            audience: 50,
            credit: 3,
            num_classes: 2,
            num_labs: 0,
            credit_au: 0,
            limit: 40,
            is_english: true,
            deleted: false,
            course_id: course.id,
            grade_sum: 0,
            load_sum: 0,
            speech_sum: 0,
            grade: 0,
            load: 0,
            speech: 0,
            review_total_weight: 0,
            new_code: searchNewCode,
          },
        })
        searchLectureId = lecture.id

        const user = await prisma.session_userprofile.create({
          data: {
            student_id: exactStudentId.toString(),
            sid: exactSid,
            uid: exactUid,
            date_joined: new Date('2026-01-01T00:00:00.000Z'),
            first_name: 'Exact',
            last_name: 'Boundary',
          },
        })
        exactUserId = user.id

        const notification = await prisma.notification.create({
          data: {
            name: exactNotificationName,
            agreementType: AgreementType.INFO,
            description: 'Exact-case notification lookup regression fixture',
          },
        })
        exactNotificationId = notification.id
      })

      afterAll(async () => {
        if (prisma !== undefined) {
          if (exactNotificationId !== undefined) {
            await prisma.notification.deleteMany({ where: { id: exactNotificationId } })
          }
          if (exactUserId !== undefined) {
            await prisma.session_userprofile.deleteMany({ where: { id: exactUserId } })
          }
          if (searchLectureId !== undefined) {
            await prisma.subject_lecture.deleteMany({ where: { id: searchLectureId } })
          }
          if (searchCourseId !== undefined) {
            await prisma.subject_course.deleteMany({ where: { id: searchCourseId } })
          }
          if (searchDepartmentId !== undefined) {
            await prisma.subject_department.deleteMany({ where: { id: searchDepartmentId } })
          }
          await prisma.$disconnect()
        }
      })

      it('Given the local PostgreSQL cluster, when listing databases, then shadow_otlplus is available for Prisma migrations', async () => {
        const databases = await getPrisma().$queryRaw<Array<{ datname: string }>>`
          SELECT datname
          FROM pg_database
          WHERE datname = 'shadow_otlplus'
        `

        expect(databases.map((database) => database.datname)).toContain('shadow_otlplus')
      })

      it('Given a mixed-case SID fixture, when UserRepository.findBySid uses exact case, then it returns the fixture user', async () => {
        const repository = new UserRepository(getPrisma())
        const user = await repository.findBySid(exactSid)

        expect(user?.id).toBe(exactUserId)
      })

      it('Given a mixed-case SID fixture, when UserRepository.findBySid varies case, then it returns null', async () => {
        const repository = new UserRepository(getPrisma())
        const user = await repository.findBySid(exactSid.toLowerCase())

        expect(user).toBeNull()
      })

      it('Given a mixed-case UID fixture, when UserRepository.findByUid uses exact case, then it returns the fixture user', async () => {
        const repository = new UserRepository(getPrisma())
        const user = await repository.findByUid(exactUid)

        expect(user?.id).toBe(exactUserId)
      })

      it('Given a mixed-case UID fixture, when UserRepository.findByUid varies case, then it returns null', async () => {
        const repository = new UserRepository(getPrisma())
        const user = await repository.findByUid(exactUid.toLowerCase())

        expect(user).toBeNull()
      })

      it('Given a numeric student ID fixture, when UserRepository.findByStudentId uses the exact value, then it returns the fixture user', async () => {
        const repository = new UserRepository(getPrisma())
        const user = await repository.findByStudentId(exactStudentId)

        expect(user?.id).toBe(exactUserId)
      })

      it('Given a numeric student ID fixture, when UserRepository.findByStudentId uses a different value, then it returns null', async () => {
        const repository = new UserRepository(getPrisma())
        const user = await repository.findByStudentId(exactStudentId + 1)

        expect(user).toBeNull()
      })

      it('Given a mixed-case UID fixture, when UserRepository.findSidByUid uses exact case, then it returns the fixture SID', async () => {
        const repository = new UserRepository(getPrisma())
        const sid = await repository.findSidByUid(exactUid)

        expect(sid).toBe(exactSid)
      })

      it('Given a mixed-case UID fixture, when UserRepository.findSidByUid varies case, then it returns null', async () => {
        const repository = new UserRepository(getPrisma())
        const sid = await repository.findSidByUid(exactUid.toLowerCase())

        expect(sid).toBeNull()
      })

      it('Given a mixed-case notification name fixture, when NotificationPrismaRepository.getNotification uses exact case, then it returns the fixture notification', async () => {
        const repository = new NotificationPrismaRepository(getPrisma())
        const notification = await repository.getNotification(exactNotificationName)

        expect(notification).toMatchObject({
          id: exactNotificationId,
          name: exactNotificationName,
        })
      })

      it('Given a mixed-case notification name fixture, when NotificationPrismaRepository.getNotification varies case, then it rejects with NO_NOTIFICATION', async () => {
        const repository = new NotificationPrismaRepository(getPrisma())
        const lookup = repository.getNotification(exactNotificationName.toLowerCase())

        await expect(lookup).rejects.toBeInstanceOf(NotificationException)
        await expect(lookup).rejects.toMatchObject({
          message: NotificationException.NO_NOTIFICATION,
          code: StatusCodes.INTERNAL_SERVER_ERROR,
        })
      })

      it('Given a mixed-case English course title, when legacy course search uses lowercase input, then it returns the fixture course', async () => {
        const repository = new CourseRepository(getPrisma())
        const courses = await repository.getCourses(
          undefined,
          undefined,
          undefined,
          undefined,
          searchCourseTitleEn.toLowerCase(),
          undefined,
          undefined,
          undefined,
          undefined,
        )

        expect(courses.map((course) => course.id)).toContain(searchCourseId)
      })

      it('Given a mixed-case English course title, when v2 course search uses lowercase input, then it returns the fixture course', async () => {
        const repository = new CourseRepositoryV2(getPrisma())
        const result = await repository.getCourses(
          undefined,
          undefined,
          undefined,
          searchCourseTitleEn.toLowerCase(),
          undefined,
          undefined,
          undefined,
          undefined,
        )

        expect(result.queryResult.map((course) => course.id)).toContain(searchCourseId)
      })

      it('Given a mixed-case legacy course code, when legacy course search uses differently cased input, then it returns the fixture course', async () => {
        const repository = new CourseRepository(getPrisma())
        const courses = await repository.getCourses(
          undefined,
          undefined,
          undefined,
          undefined,
          searchOldCode.toLowerCase(),
          undefined,
          undefined,
          undefined,
          undefined,
        )

        expect(courses.map((course) => course.id)).toContain(searchCourseId)
      })

      it('Given a mixed-case new course code, when legacy course search uses differently cased input, then it returns the fixture course', async () => {
        const repository = new CourseRepository(getPrisma())
        const courses = await repository.getCourses(
          undefined,
          undefined,
          undefined,
          undefined,
          searchNewCode.toUpperCase(),
          undefined,
          undefined,
          undefined,
          undefined,
        )

        expect(courses.map((course) => course.id)).toContain(searchCourseId)
      })

      it('Given a mixed-case legacy course code, when v2 course search uses differently cased input, then it returns the fixture course', async () => {
        const repository = new CourseRepositoryV2(getPrisma())
        const result = await repository.getCourses(
          undefined,
          undefined,
          undefined,
          searchOldCode.toLowerCase(),
          undefined,
          undefined,
          undefined,
          undefined,
        )

        expect(result.queryResult.map((course) => course.id)).toContain(searchCourseId)
      })

      it('Given a mixed-case new course code, when v2 course search uses differently cased input, then it returns the fixture course', async () => {
        const repository = new CourseRepositoryV2(getPrisma())
        const result = await repository.getCourses(
          undefined,
          undefined,
          undefined,
          searchNewCode.toUpperCase(),
          undefined,
          undefined,
          undefined,
          undefined,
        )

        expect(result.queryResult.map((course) => course.id)).toContain(searchCourseId)
      })

      it('Given a mixed-case English course title, when course autocomplete uses a lowercase prefix, then it returns the fixture course', async () => {
        const repository = new CourseRepository(getPrisma())
        const course = await repository.getCourseAutocomplete(searchCourseTitleEn.toLowerCase())

        expect(course?.id).toBe(searchCourseId)
      })

      it('Given a mixed-case English lecture title, when the legacy lecture keyword filter uses lowercase input, then it returns the fixture lecture', async () => {
        const repository = new CourseRepository(getPrisma())
        const keywordFilter = repository.keywordFilter(searchLectureTitleEn.toLowerCase(), false)

        expect(keywordFilter).not.toBeNull()
        if (keywordFilter === null) {
          throw new Error('Expected the legacy lecture keyword filter to be present')
        }

        const lectures = await getPrisma().subject_lecture.findMany({ where: keywordFilter })

        expect(lectures.map((lecture) => lecture.id)).toContain(searchLectureId)
      })

      it('Given a mixed-case English lecture title, when the v2 lecture keyword filter uses lowercase input, then it returns the fixture lecture', async () => {
        const repository = new CourseRepositoryV2(getPrisma())
        const keywordFilter = repository.keywordFilter(searchLectureTitleEn.toLowerCase(), false)

        expect(keywordFilter).not.toBeNull()
        if (keywordFilter === null) {
          throw new Error('Expected the v2 lecture keyword filter to be present')
        }

        const lectures = await getPrisma().subject_lecture.findMany({ where: keywordFilter })

        expect(lectures.map((lecture) => lecture.id)).toContain(searchLectureId)
      })

      it('Given a mixed-case English lecture title, when lecture autocomplete uses a lowercase prefix, then it returns the fixture lecture', async () => {
        const courseRepository = new CourseRepository(getPrisma())
        const repository = new LectureRepository(getPrisma(), courseRepository)
        const lecture = await repository.getLectureAutocomplete(2026, 1, searchLectureTitleEn.toLowerCase())

        expect(lecture?.id).toBe(searchLectureId)
      })

      it('Given _prisma_migrations, when reading migration metadata, then exactly one successful migration is 0_init and no row is unfinished', async () => {
        const prismaClient = getPrisma()
        const migrations = await prismaClient.$queryRaw<
          Array<{
            migration_name: string
            finished_at: Date | null
            rolled_back_at: Date | null
          }>
        >`
        SELECT migration_name, finished_at, rolled_back_at
        FROM "_prisma_migrations"
      `

        const unfinishedOrRolledBack = migrations.filter(
          (migration) => migration.finished_at == null || migration.rolled_back_at !== null,
        )

        expect(unfinishedOrRolledBack).toEqual([])

        const completedMigrationNames = migrations
          .filter((migration) => migration.finished_at !== null && migration.rolled_back_at === null)
          .map((migration) => migration.migration_name)

        expect(completedMigrationNames.sort()).toEqual(['0_init'])
      })

      it('Given subject_course and subject_lecture, when querying information_schema generated columns, then only expected computed columns are marked ALWAYS', async () => {
        const prismaClient = getPrisma()
        const generatedColumns = await prismaClient.$queryRaw<
          Array<{
            table_name: string
            column_name: string
            is_generated: string
          }>
        >`
        SELECT table_name, column_name, is_generated
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name IN ('subject_course', 'subject_lecture')
          AND column_name IN ('title_no_space', 'title_en_no_space', 'level')
          AND is_generated = 'ALWAYS'
      `

        const expectedPairs = [
          'subject_course.title_no_space',
          'subject_course.title_en_no_space',
          'subject_course.level',
          'subject_lecture.title_no_space',
          'subject_lecture.title_en_no_space',
          'subject_lecture.level',
        ] as const

        expect(generatedColumns).toHaveLength(expectedPairs.length)

        const columnPairs = new Set(generatedColumns.map((column) => `${column.table_name}.${column.column_name}`))

        for (const expectedPair of expectedPairs) {
          expect(columnPairs).toContain(expectedPair)
        }
      })

      it('Given subject_course and subject_lecture inserts and updates, when generated columns are evaluated, then stored computed values match expected whitespace stripping and level extraction', async () => {
        const uniqueSuffix = `${Date.now()}`.slice(-6)
        const uniqueDepartmentId = 900000 + Number(uniqueSuffix)
        const uniqueDepartmentCode = `D${uniqueSuffix.slice(-4)}`

        const created: {
          departmentId?: number
          courseId?: number
          lectureId?: number
        } = {}

        try {
          const prismaClient = getPrisma()

          const department = await prismaClient.subject_department.create({
            data: {
              id: uniqueDepartmentId,
              num_id: uniqueSuffix.slice(-4),
              code: uniqueDepartmentCode,
              name: `Integration ${uniqueSuffix}`,
              name_en: `Integration ${uniqueSuffix} EN`,
              visible: true,
            },
          })

          created.departmentId = department.id

          const course = await prismaClient.subject_course.create({
            data: {
              old_code: `OC-${uniqueSuffix}`,
              department_id: department.id,
              type: 'LECTURE',
              type_en: 'LECTURE',
              title: 'Course  \tOne  Two',
              title_en: 'Course  EN  Two',
              summury: 'Generated column behavior integration baseline',
              grade_sum: 0,
              load_sum: 0,
              speech_sum: 0,
              review_total_weight: 0,
              grade: 0,
              load: 0,
              speech: 0,
              new_code: 'CS.321',
              representative_lecture_id: 0,
            },
          })

          created.courseId = course.id

          expect(course.title_no_space).toBe('CourseOneTwo')
          expect(course.title_en_no_space).toBe('CourseENTwo')
          expect(course.level).toBe('3')

          const lecture = await prismaClient.subject_lecture.create({
            data: {
              code: `L${uniqueSuffix}`,
              old_code: `L${uniqueSuffix}`,
              year: 2025,
              semester: 1,
              department_id: department.id,
              class_no: 'A01',
              title: 'Lecture  \tOne  Two',
              title_en: 'Lecture  EN  Two',
              type: 'LEC',
              type_en: 'LEC',
              audience: 50,
              credit: 3,
              num_classes: 2,
              num_labs: 1,
              credit_au: 1,
              limit: 40,
              is_english: false,
              deleted: false,
              course_id: course.id,
              grade_sum: 0,
              load_sum: 0,
              speech_sum: 0,
              grade: 0,
              load: 0,
              speech: 0,
              review_total_weight: 0,
              new_code: 'CS.321',
            },
          })

          created.lectureId = lecture.id

          expect(lecture.title_no_space).toBe('LectureOneTwo')
          expect(lecture.title_en_no_space).toBe('LectureENTwo')
          expect(lecture.level).toBe('3')

          const updatedCourse = await prismaClient.subject_course.update({
            where: { id: course.id },
            data: {
              title: 'Course\tUpdated  Three',
              title_en: 'Course  EN  Updated',
              new_code: 'EE.445',
            },
          })

          expect(updatedCourse.title_no_space).toBe('CourseUpdatedThree')
          expect(updatedCourse.title_en_no_space).toBe('CourseENUpdated')
          expect(updatedCourse.level).toBe('4')

          const updatedLecture = await prismaClient.subject_lecture.update({
            where: { id: lecture.id },
            data: {
              title: 'Lecture\tUpdated  Three',
              title_en: 'Lecture  EN  Updated',
              new_code: 'EE.445',
            },
          })

          expect(updatedLecture.title_no_space).toBe('LectureUpdatedThree')
          expect(updatedLecture.title_en_no_space).toBe('LectureENUpdated')
          expect(updatedLecture.level).toBe('4')
        } finally {
          if (prisma === undefined) {
            return
          }

          if (created.lectureId !== undefined) {
            await prisma.subject_lecture.deleteMany({ where: { id: created.lectureId } })
          }

          if (created.courseId !== undefined) {
            await prisma.subject_course.deleteMany({ where: { id: created.courseId } })
          }

          if (created.departmentId !== undefined) {
            await prisma.subject_department.deleteMany({ where: { id: created.departmentId } })
          }
        }
      })
    },
  )

  it('Given postgres:18 in local docker compose, when checking volume mounts, then data volume targets /var/lib/postgresql', async () => {
    const dockerComposeContent = await fs.readFile(dockerComposePath, 'utf8')
    const composeLines = dockerComposeContent.split(/\r?\n/)

    expect(dockerComposeContent).toMatch(/image:\s*postgres:18/)
    expect(composeLines.some((line) => /:\/var\/lib\/postgresql/.test(line))).toBe(true)
    expect(composeLines.some((line) => /:\/var\/lib\/postgresql\/data/.test(line))).toBe(false)
  })

  it('Given local PostgreSQL bootstrap assets, when checking the shadow initializer, then init-shadow-db.sql exists', async () => {
    const exists = await fs
      .access(initShadowDatabasePath)
      .then(() => true)
      .catch(() => false)

    expect(exists).toBe(true)
  })

  it('Given init-shadow-db.sql, when reading its bootstrap SQL, then it creates shadow_otlplus', async () => {
    const shadowDatabaseSql = await fs.readFile(initShadowDatabasePath, 'utf8').catch(() => '')

    expect(shadowDatabaseSql).toMatch(/CREATE\s+DATABASE\s+"?shadow_otlplus"?\s*;/i)
  })

  it('Given local PostgreSQL compose configuration, when checking init scripts, then the shadow initializer is mounted read-only at the deterministic bootstrap path', async () => {
    const dockerComposeContent = await fs.readFile(dockerComposePath, 'utf8')
    const composeLines = dockerComposeContent.split(/\r?\n/).map((line) => line.trim())

    expect(composeLines).toContain('- ./init-shadow-db.sql:/docker-entrypoint-initdb.d/10-init-shadow-db.sql:ro')
  })

  it('Given apps/server/local-SSO-swap.ts, when loading PrismaClient, then settings datasourceUrl is used instead of legacy DATABASE_* fallback', async () => {
    const swapFileContent = await fs.readFile(localSSOSwapPath, 'utf8')

    expect(swapFileContent).toContain("from './src/settings'")
    expect(swapFileContent).toMatch(
      /new PrismaClient\({[\s\S]*\bdatasourceUrl\s*:\s*settings\(\)\.ormconfig\(\)\.datasourceUrl[\s\S]*}\s*\)/,
    )
  })

  it('Given the obsolete init-exporter SQL fixture, when checking deploy/docker assets, then init-exporter.sql must be absent', async () => {
    const exists = await fs
      .access(initExporterPath)
      .then(() => true)
      .catch(() => false)

    expect(exists).toBe(false)
  })

  it('Given package.json scripts, when validating PostgreSQL schema workflows, then db push is unavailable and db init uses migrations', async () => {
    const packageJson = await fs.readFile(rootPackageJsonPath, 'utf8')
    const dbInitScript = packageJson.match(/"db:init"\s*:\s*"([^"]+)"/)?.[1]

    expect(packageJson).not.toMatch(/"db:push"\s*:/)
    expect(dbInitScript).toBeDefined()
    expect(dbInitScript).toContain('prisma migrate deploy')
    expect(dbInitScript).toContain('--schema ./libs/prisma-client/src/schema.prisma')
    expect(dbInitScript).not.toContain('prisma db push')
    expect(dbInitScript).not.toContain('prisma db execute')
    expect(dbInitScript).not.toContain('prisma migrate resolve')
    expect(dbInitScript).not.toContain('--applied 0_init')
    expect(packageJson).toMatch(/"migrate:create:dev"\s*:/)
    expect(packageJson).toMatch(/"migrate:dev"\s*:/)
    expect(packageJson).toMatch(/"migrate:create:local"\s*:/)
    expect(packageJson).toMatch(/"migrate:local"\s*:/)
  })
})
