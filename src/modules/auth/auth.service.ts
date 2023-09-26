import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Prisma, session_userprofile } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { SSOUser } from '../../common/interfaces/dto/auth/sso.dto';
import { import_student_lectures } from '../../common/scholarDB/scripts';
import { UserRepository } from '../../prisma/repositories/user.repository';
import settings from '../../settings';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
  ) {}

  public async findBySid(sid: string) {
    return this.userRepository.findBySid(sid);
  }

  public async ssoLogin(ssoProfile: SSOUser) {
    const sid = ssoProfile.sid;
    let user = await this.findBySid(sid);

    const kaistInfo = ssoProfile.kaist_info;
    const studentId = kaistInfo.ku_std_no ?? '';

    const { accessToken, ...accessTokenOptions } =
      this.getCookieWithAccessToken(sid);
    const { refreshToken, ...refreshTokenOptions } =
      this.getCookieWithRefreshToken(sid);

    const salt = await bcrypt.genSalt(Number(process.env.saltRounds));
    const encryptedRefreshToken = await bcrypt.hash(refreshToken, salt);

    if (!user) {
      user = await this.createUser(
        sid,
        ssoProfile['email'],
        studentId,
        ssoProfile['first_name'],
        ssoProfile['last_name'],
        encryptedRefreshToken,
      );
    } else {
      if (user.student_id != studentId) {
        await import_student_lectures(studentId);
      }

      const updateData = {
        first_name: ssoProfile['first_name'],
        last_name: ssoProfile['last_name'],
        student_id: studentId,
        refresh_token: encryptedRefreshToken,
      };
      user = await this.updateUser(user.id, updateData);
    }

    return {
      accessToken,
      accessTokenOptions,
      refreshToken,
      refreshTokenOptions,
    };
  }

  public getCookieWithToken<T extends 'refreshToken' | 'accessToken'>(
    sid: string,
  ) {}

  public getCookieWithAccessToken(sid: string) {
    const payload = {
      sid: sid,
    };

    const jwtConfig = settings().getJwtConfig();
    const token = this.jwtService.sign(payload, {
      secret: jwtConfig.secret,
      expiresIn: jwtConfig.signOptions.expiresIn + 's',
    });
    return {
      accessToken: token,
      path: '/',
      httpOnly: true,
      maxAge: Number(jwtConfig.signOptions.expiresIn) * 1000,
    };
  }

  public getCookieWithRefreshToken(sid: string) {
    const payload = {
      sid: sid,
    };

    const jwtConfig = settings().getJwtConfig();
    const refreshToken = this.jwtService.sign(payload, {
      secret: jwtConfig.secret,
      expiresIn: jwtConfig.signOptions.refreshExpiresIn + 's',
    });
    return {
      refreshToken: refreshToken,
      path: '/',
      httpOnly: true,
      maxAge: Number(jwtConfig.signOptions.refreshExpiresIn) * 1000,
    };
  }

  async createUser(
    sid: string,
    email: string,
    studentId: string,
    firstName: string,
    lastName: string,
    refreshToken: string,
  ): Promise<session_userprofile> {
    const user = {
      sid: sid,
      email: email,
      first_name: firstName,
      last_name: lastName,
      date_joined: new Date(),
      student_id: studentId,
      refresh_token: refreshToken,
    };
    return await this.userRepository.createUser(user);
  }

  async updateUser(
    userId,
    user: Prisma.session_userprofileUpdateInput,
  ): Promise<session_userprofile> {
    return await this.userRepository.updateUser(userId, user);
  }
}
