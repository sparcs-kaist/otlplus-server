import type { ICourse, IReview } from '@otl/server-nest/common/interfaces'

export const CHANNEL_TALK_SYSTEM_VERSION = 'v1' as const

export const CHANNEL_TALK_COURSE_CATALOG = Symbol('CHANNEL_TALK_COURSE_CATALOG')
export const CHANNEL_TALK_SIGNING_KEY = Symbol('CHANNEL_TALK_SIGNING_KEY')

export const CHANNEL_TALK_FUNCTION = {
  discover: 'extension.core.function.getFunctions',
  commands: 'extension.command.metadata.getCommands',
  searchCourses: 'otl.course.search',
  listCourseReviews: 'otl.course.reviews',
} as const

export type ChannelTalkFunctionName = (typeof CHANNEL_TALK_FUNCTION)[keyof typeof CHANNEL_TALK_FUNCTION]

export type ChannelTalkRequest = {
  readonly method: string
  readonly params: unknown
  readonly context?: unknown
  readonly systemVersion: string
}

export type ChannelTalkError = {
  readonly error: {
    readonly code: number
    readonly type: string
    readonly message: string
  }
}

export type ChannelTalkResult = {
  readonly result: unknown
}

export type ChannelTalkResponse = ChannelTalkError | ChannelTalkResult

const commandResultSchema = {
  type: 'object',
  properties: {
    type: { type: 'string', minLength: 1 },
    attributes: { type: 'object', additionalProperties: true },
  },
  required: ['type'],
  additionalProperties: false,
} as const

export const CHANNEL_TALK_FUNCTION_SCHEMAS = [
  {
    name: CHANNEL_TALK_FUNCTION.commands,
    description: 'OTL 과목 검색과 과목 후기 ALF Command 정의를 반환합니다.',
    inputSchema: { type: 'object', additionalProperties: false },
    outputSchema: {
      type: 'object',
      properties: {
        commands: {
          type: 'array',
          maxItems: 30,
          items: {
            type: 'object',
            properties: {
              name: { type: 'string', minLength: 1, maxLength: 30 },
              scope: { type: 'string', enum: ['front', 'desk'] },
              description: { type: 'string', maxLength: 100 },
              actionFunctionName: { type: 'string', minLength: 1 },
              systemVersion: { type: 'string' },
              alfMode: { type: 'string', enum: ['disable', 'recommend'] },
              alfDescription: { type: 'string', maxLength: 1500 },
              paramDefinitions: { type: 'array', maxItems: 10 },
              enabledByDefault: { type: 'boolean' },
            },
            required: ['name', 'scope', 'actionFunctionName', 'alfMode'],
          },
        },
      },
      required: ['commands'],
    },
  },
  {
    name: CHANNEL_TALK_FUNCTION.searchCourses,
    description: '과목명, 과목 코드, 학과명 또는 교수명으로 OTL 과목을 검색합니다.',
    inputSchema: {
      type: 'object',
      properties: {
        input: {
          type: 'object',
          properties: {
            keyword: { type: 'string', minLength: 1, maxLength: 100 },
            limit: { type: 'integer', minimum: 1, maximum: 10 },
          },
          required: ['keyword'],
          additionalProperties: true,
        },
        language: { type: 'string' },
      },
      required: ['input'],
      additionalProperties: true,
    },
    outputSchema: commandResultSchema,
  },
  {
    name: CHANNEL_TALK_FUNCTION.listCourseReviews,
    description: 'OTL 과목 ID로 최신 과목 후기를 조회합니다.',
    inputSchema: {
      type: 'object',
      properties: {
        input: {
          type: 'object',
          properties: {
            courseId: { type: 'integer', minimum: 1 },
            limit: { type: 'integer', minimum: 1, maximum: 10 },
          },
          required: ['courseId'],
          additionalProperties: true,
        },
        language: { type: 'string' },
      },
      required: ['input'],
      additionalProperties: true,
    },
    outputSchema: commandResultSchema,
  },
] as const

export const CHANNEL_TALK_COMMANDS = [
  {
    name: 'otl-course-search',
    scope: 'desk',
    description: 'OTL에서 과목을 검색합니다.',
    actionFunctionName: CHANNEL_TALK_FUNCTION.searchCourses,
    systemVersion: CHANNEL_TALK_SYSTEM_VERSION,
    alfMode: 'recommend',
    alfDescription: '사용자가 KAIST 과목, 과목 코드, 학과, 교수로 과목을 찾으려 할 때 추천합니다.',
    paramDefinitions: [
      {
        name: 'keyword',
        type: 'string',
        required: true,
        description: '과목명, 과목 코드, 학과 또는 교수',
        alfDescription: '사용자의 질문에서 검색할 핵심어를 추출합니다.',
      },
      {
        name: 'limit',
        type: 'int',
        required: false,
        description: '검색 결과 개수(1~10)',
        alfDescription: '사용자가 개수를 지정하지 않으면 5를 사용합니다.',
      },
    ],
    enabledByDefault: true,
  },
  {
    name: 'otl-course-reviews',
    scope: 'desk',
    description: 'OTL 과목 후기를 조회합니다.',
    actionFunctionName: CHANNEL_TALK_FUNCTION.listCourseReviews,
    systemVersion: CHANNEL_TALK_SYSTEM_VERSION,
    alfMode: 'recommend',
    alfDescription: '사용자가 특정 KAIST 과목의 수강 후기, 난이도, 과제량 또는 강의평을 물을 때 추천합니다.',
    paramDefinitions: [
      {
        name: 'courseId',
        type: 'int',
        required: true,
        description: '과목 검색 결과의 OTL 과목 ID',
        alfDescription: '먼저 과목 검색 Command로 확인한 과목 ID를 사용합니다.',
      },
      {
        name: 'limit',
        type: 'int',
        required: false,
        description: '후기 개수(1~10)',
        alfDescription: '사용자가 개수를 지정하지 않으면 5를 사용합니다.',
      },
    ],
    enabledByDefault: true,
  },
] as const

export type CourseCatalog = Pick<CoursesServiceContract, 'getCourses' | 'getReviewsByCourseId'>

type CoursesServiceContract = {
  readonly getCourses: (query: ICourse.Query, user: undefined) => Promise<ICourse.DetailWithIsRead[]>
  readonly getReviewsByCourseId: (
    query: ICourse.ReviewQueryDto,
    id: number,
    user: undefined,
  ) => Promise<IReview.Basic[]>
}
