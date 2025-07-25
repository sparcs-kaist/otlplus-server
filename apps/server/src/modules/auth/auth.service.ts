import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { AGREEMENT_IN_PUBLIC_PORT } from '@otl/server-nest/modules/agreement/domain/agreement.in.port'
import { AgreementInPublicPort } from '@otl/server-nest/modules/agreement/domain/agreement.in.public.port'
import { UserNotificationCreate } from '@otl/server-nest/modules/notification/domain/notification'
import settings from '@otl/server-nest/settings'
import { session_userprofile } from '@prisma/client'
import * as bcrypt from 'bcrypt'
import { Request } from 'express'

import { AgreementType } from '@otl/common/enum/agreement'

import { ESSOUser } from '@otl/prisma-client/entities/ESSOUser'
import { UserRepository } from '@otl/prisma-client/repositories'
import { NotificationPrismaRepository } from '@otl/prisma-client/repositories/notification.repository'

import { SyncTakenLectureService } from '../sync/syncTakenLecture.service'

@Injectable()
export class AuthService {
  private readonly jwtConfig = settings().getJwtConfig()

  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
    private readonly syncTakenLecturesService: SyncTakenLectureService,
    private readonly notificationRepository: NotificationPrismaRepository,
    @Inject(AGREEMENT_IN_PUBLIC_PORT)
    private readonly agreementService: AgreementInPublicPort,
  ) {}

  public async findBySid(sid: string) {
    return this.userRepository.findBySid(sid)
  }

  public async findByStudentId(studentId: number) {
    return this.userRepository.findByStudentId(studentId)
  }

  public async ssoLogin(ssoProfile: ESSOUser.SSOUser) {
    const { sid, uid, kaist_id } = ssoProfile
    const status = ssoProfile.kaist_v2_info.std_status_kor ?? null
    let user = await this.findBySid(sid)

    // const kaistInfo = ssoProfile.kaist_info
    const kaistInfo = ssoProfile.kaist_v2_info
    const studentId = kaistInfo.std_no ?? ''
    const departmentId = kaistInfo.std_dept_id ? Number(kaistInfo.std_dept_id) : undefined

    const { accessToken, ...accessTokenOptions } = this.getCookieWithAccessToken(sid)
    const { refreshToken, ...refreshTokenOptions } = this.getCookieWithRefreshToken(sid)

    const salt = await bcrypt.genSalt(Number(process.env.saltRounds))
    const encryptedRefreshToken = await bcrypt.hash(refreshToken, salt)

    if (!user) {
      user = await this.createUser(
        uid,
        sid,
        ssoProfile.email,
        studentId,
        ssoProfile.first_name,
        ssoProfile.last_name,
        departmentId,
        status,
        kaist_id,
        encryptedRefreshToken,
      )
      await this.syncTakenLecturesService.repopulateTakenLectureForStudent(user.id)
    }
    else {
      const prev_student_id = user.student_id
      const updateData = {
        first_name: ssoProfile.first_name,
        last_name: ssoProfile.last_name,
        student_id: studentId,
        // department_id: departmentId,
        status,
        kaist_id,
        last_login: new Date(),
        refresh_token: encryptedRefreshToken,
      }
      user = await this.updateUser(user.id, updateData)
      if (prev_student_id !== studentId) {
        await this.syncTakenLecturesService.repopulateTakenLectureForStudent(user.id)
      }
    }

    const userNotifications = await this.notificationRepository.findByUserId(user.id)
    const notificationTypes = await this.notificationRepository.getAllNotification()
    if (!userNotifications || userNotifications.length !== notificationTypes.length) {
      const userNotificationCreates: UserNotificationCreate[] = notificationTypes.map((n) => {
        let active = false
        if (n.agreementType === AgreementType.INFO) {
          active = true
        }
        return {
          notificationId: n.id,
          userId: user.id,
          notificationName: n.name,
          active,
        }
      })
      await this.notificationRepository.upsertMany(userNotificationCreates)
    }
    await this.agreementService.initialize(user.id)

    return {
      accessToken,
      accessTokenOptions,
      refreshToken,
      refreshTokenOptions,
    }
  }

  public getCookieWithAccessToken(sid: string) {
    const payload = {
      sid,
    }

    const jwtConfig = settings().getJwtConfig()
    const token = this.jwtService.sign(payload, {
      secret: jwtConfig.secret,
      expiresIn: `${jwtConfig.signOptions.expiresIn}s`,
    })
    return {
      accessToken: token,
      path: '/',
      httpOnly: true,
      sameSite: 'none' as const,
      maxAge: Number(jwtConfig.signOptions.expiresIn) * 1000,
      secure: true,
    }
  }

  public getCookieWithRefreshToken(sid: string) {
    const payload = {
      sid,
    }

    const jwtConfig = settings().getJwtConfig()
    const refreshToken = this.jwtService.sign(payload, {
      secret: jwtConfig.secret,
      expiresIn: `${jwtConfig.signOptions.refreshExpiresIn}s`,
    })
    return {
      refreshToken,
      path: '/',
      httpOnly: true,
      sameSite: 'none' as const,
      maxAge: Number(jwtConfig.signOptions.refreshExpiresIn) * 1000,
      secure: true,
    }
  }

  async createUser(
    uid: string,
    sid: string,
    email: string,
    studentId: string,
    firstName: string,
    lastName: string,
    departmentId: number | undefined,
    status: string | null,
    kaistuid: string | null,
    refreshToken: string,
    lastLogin: Date = new Date(),
  ): Promise<session_userprofile> {
    const user = {
      sid,
      uid,
      email,
      first_name: firstName,
      last_name: lastName,
      date_joined: new Date(),
      last_login: lastLogin,
      student_id: studentId,
      // department_id: departmentId,
      status,
      kaist_id: kaistuid,
      refresh_token: refreshToken,
    }
    return await this.userRepository.createUser(user)
  }

  async updateUser(userId: number, user: any): Promise<session_userprofile> {
    return await this.userRepository.updateUser(userId, user)
  }

  async tokenRefresh(refreshToken: any) {
    const payload = await this.jwtService.verifyAsync(refreshToken, {
      secret: this.jwtConfig.secret,
      ignoreExpiration: false,
    })
    const user = await this.findBySid(payload.sid)
    if (!user) throw new NotFoundException('user is not found')
    const { accessToken, ...accessTokenOptions } = this.getCookieWithAccessToken(payload.sid)
    const { refreshToken: newRefreshToken, ...refreshTokenOptions } = this.getCookieWithRefreshToken(payload.sid)
    return {
      accessToken,
      accessTokenOptions,
      refreshToken: newRefreshToken,
      refreshTokenOptions,
    }
  }

  public extractTokenFromHeader(request: Request, type: 'accessToken' | 'refreshToken'): string | undefined {
    if (type === 'accessToken') {
      const authHeader = request.headers.authorization
      if (authHeader && authHeader.startsWith('Bearer ')) {
        return authHeader.slice(7)
      }
    }
    if (type === 'refreshToken') {
      const refreshHeader = request.headers['X-REFRESH-TOKEN']
      if (typeof refreshHeader === 'string') {
        return refreshHeader
      }
    }
    return undefined
  }

  public extractTokenFromCookie(request: Request, type: 'accessToken' | 'refreshToken'): string | undefined {
    return request.cookies?.[type]
  }
}
