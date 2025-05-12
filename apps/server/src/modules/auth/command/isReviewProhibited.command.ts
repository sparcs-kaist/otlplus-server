import { ExecutionContext, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { IS_REVIEW_PROHIBITED_KEY } from '@otl/server-nest/common/decorators/prohibit-review.decorator'
import { AuthCommand, AuthResult } from '@otl/server-nest/modules/auth/auth.command'
import { LecturesService } from '@otl/server-nest/modules/lectures/lectures.service'
import { Request } from 'express'

import { PrismaService } from '@otl/prisma-client/prisma.service'

@Injectable()
export class IsReviewProhibitedCommand implements AuthCommand {
  constructor(
    private reflector: Reflector,
    private lectureService: LecturesService,
    private prismaService: PrismaService,
  ) {}

  public async next(context: ExecutionContext, prevResult: AuthResult): Promise<AuthResult> {
    const isReviewProhibited = this.reflector.getAllAndOverride<boolean>(IS_REVIEW_PROHIBITED_KEY, [
      context.getHandler(),
    ])

    const request = context.switchToHttp().getRequest<Request>()
    const requestTime = new Date()
    const reviewsBody = request.body

    if (isReviewProhibited) {
      try {
        if (!reviewsBody || !reviewsBody.lecture) {
          throw new Error('lecture info are not found from request')
        }
        const lecture = await this.lectureService.getLectureById(reviewsBody.lecture)
        const semester = await this.prismaService.subject_semester.findFirst({
          where: {
            AND: [{ year: lecture.year }, { semester: lecture.semester }],
          },
          select: {
            courseDropDeadline: true,
          },
        })
        if (!semester || !semester.courseDropDeadline) {
          throw new Error('semester info are not found from request')
        }

        if (requestTime < semester.courseDropDeadline) {
          return Promise.resolve({
            ...prevResult,
            authorization: false,
          })
        }

        return Promise.resolve(prevResult)
      }
      catch (_e) {
        return Promise.resolve(prevResult)
      }
    }

    return Promise.resolve(prevResult)
  }
}
