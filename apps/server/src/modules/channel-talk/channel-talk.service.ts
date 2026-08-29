import { Inject, Injectable } from '@nestjs/common'
import { type ICourse, type IReview } from '@otl/server-nest/common/interfaces'

import {
  CHANNEL_TALK_COMMANDS,
  CHANNEL_TALK_COURSE_CATALOG,
  CHANNEL_TALK_FUNCTION,
  CHANNEL_TALK_FUNCTION_SCHEMAS,
  CHANNEL_TALK_SYSTEM_VERSION,
  type ChannelTalkRequest,
  type ChannelTalkResponse,
  type CourseCatalog,
} from './channel-talk.contract'

const DEFAULT_RESULT_LIMIT = 5
const MAX_RESULT_LIMIT = 10

class ChannelTalkInputError extends Error {
  constructor(message: string) {
    super(message)
    this.name = ChannelTalkInputError.name
  }
}

@Injectable()
export class ChannelTalkService {
  constructor(
    @Inject(CHANNEL_TALK_COURSE_CATALOG)
    private readonly coursesService: CourseCatalog,
  ) {}

  async handle(version: string, body: unknown): Promise<ChannelTalkResponse> {
    try {
      const request = this.parseRequest(version, body)

      switch (request.method) {
        case CHANNEL_TALK_FUNCTION.discover:
          return {
            result: {
              functions: CHANNEL_TALK_FUNCTION_SCHEMAS,
              success: true,
              errorMessage: '',
            },
          }
        case CHANNEL_TALK_FUNCTION.commands:
          return { result: { commands: CHANNEL_TALK_COMMANDS } }
        case CHANNEL_TALK_FUNCTION.searchCourses:
          return await this.searchCourses(request.params)
        case CHANNEL_TALK_FUNCTION.listCourseReviews:
          return await this.listCourseReviews(request.params)
        default:
          return {
            error: {
              code: -32601,
              type: 'methodNotFound',
              message: `Unknown function: ${request.method}`,
            },
          }
      }
    }
    catch (error) {
      if (error instanceof ChannelTalkInputError) {
        return {
          error: {
            code: 2,
            type: 'invalidParams',
            message: error.message,
          },
        }
      }
      throw error
    }
  }

  private parseRequest(version: string, body: unknown): ChannelTalkRequest {
    if (version !== CHANNEL_TALK_SYSTEM_VERSION) {
      throw new ChannelTalkInputError(`unsupported system version: ${version}`)
    }
    if (!this.isRecord(body) || typeof body.method !== 'string') {
      throw new ChannelTalkInputError('method must be a string')
    }
    if (body.systemVersion !== undefined && body.systemVersion !== version) {
      throw new ChannelTalkInputError('systemVersion must match the endpoint version')
    }
    return {
      method: body.method,
      params: body.params ?? {},
      context: body.context,
      systemVersion: version,
    }
  }

  private async searchCourses(params: unknown): Promise<ChannelTalkResponse> {
    const input = this.getCommandInput(params)
    const { keyword } = input
    if (typeof keyword !== 'string' || keyword.trim().length === 0) {
      throw new ChannelTalkInputError('keyword must be a non-empty string')
    }
    const normalizedKeyword = keyword.trim()
    if (normalizedKeyword.length > 100) {
      throw new ChannelTalkInputError('keyword must be 100 characters or fewer')
    }
    const limit = this.getLimit(input.limit)
    const courses = await this.coursesService.getCourses({ keyword: normalizedKeyword, limit }, undefined, {
      includeMissingRepresentativeLecture: true,
    })

    return {
      result: {
        type: 'text',
        attributes: {
          message:
            courses.length === 0
              ? `'${normalizedKeyword}'에 대한 과목 검색 결과가 없습니다.`
              : courses.map((course) => this.formatCourse(course)).join('\n\n'),
        },
      },
    }
  }

  private async listCourseReviews(params: unknown): Promise<ChannelTalkResponse> {
    const input = this.getCommandInput(params)
    const { courseId } = input
    if (typeof courseId !== 'number' || !Number.isInteger(courseId) || courseId <= 0) {
      throw new ChannelTalkInputError('courseId must be a positive integer')
    }
    const limit = this.getLimit(input.limit)
    const reviews = await this.coursesService.getReviewsByCourseId(
      { limit, order: ['-written_datetime', '-id'] },
      courseId,
      undefined,
    )

    return {
      result: {
        type: 'text',
        attributes: {
          message:
            reviews.length === 0
              ? `과목 ID ${courseId}에 등록된 후기가 없습니다.`
              : reviews.map((review) => this.formatReview(review)).join('\n\n'),
        },
      },
    }
  }

  private getCommandInput(params: unknown): Record<string, unknown> {
    if (!this.isRecord(params)) {
      throw new ChannelTalkInputError('params must be an object')
    }
    const input = params.input ?? {}
    if (!this.isRecord(input)) {
      throw new ChannelTalkInputError('params.input must be an object')
    }
    return input
  }

  private getLimit(value: unknown): number {
    if (value === undefined) return DEFAULT_RESULT_LIMIT
    if (typeof value !== 'number' || !Number.isInteger(value) || value < 1 || value > MAX_RESULT_LIMIT) {
      throw new ChannelTalkInputError(`limit must be an integer between 1 and ${MAX_RESULT_LIMIT}`)
    }
    return value
  }

  private formatCourse(course: ICourse.DetailWithIsRead): string {
    const professors = course.professors.map((professor) => professor.name).join(', ') || '교수 미정'
    return [
      `[과목 ID: ${course.id}] ${course.title} (${course.old_code})`,
      `${course.department.name} · ${course.credit}학점 · ${professors}`,
      `성적 ${course.grade.toFixed(1)} / 과제 ${course.load.toFixed(1)} / 강의 ${course.speech.toFixed(1)}`,
    ].join('\n')
  }

  private formatReview(review: IReview.Basic): string {
    const professors = review.lecture.professors.map((professor) => professor.name).join(', ') || '교수 미정'
    const content = review.content.length > 300 ? `${review.content.slice(0, 297)}...` : review.content
    return [
      `[${review.lecture.year}년 ${review.lecture.semester}학기 · ${professors}]`,
      content,
      `성적 ${review.grade}/5 · 과제 ${review.load}/5 · 강의 ${review.speech}/5 · 좋아요 ${review.like}`,
    ].join('\n')
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value)
  }
}
