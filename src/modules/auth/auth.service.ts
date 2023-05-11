import { PrismaService } from "../../prisma/prisma.service";
import { Injectable } from "@nestjs/common";
import { UserRepository } from "../../prisma/repositories/user.repository";
import { Prisma, session_userprofile } from "@prisma/client";
import { JwtService } from "@nestjs/jwt";
import settings from "../../settings";
import session from "express-session";

@Injectable()
export class AuthService{
    constructor(
        private readonly userRepository: UserRepository,
        private readonly jwtService: JwtService,
    ){}

    public async findBySid(sid: string){
        return this.userRepository.findBySid(sid);
    }

    public async ssoLogin(){
        //@Todo: Implement SSO Login

    }

    public getCookieWithAccessToken(user: session_userprofile) {
        const payload = {
            sid: user.sid
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

    public getCookieWithRefreshToken(user: session_userprofile) {
        const payload = {
            sid: user.sid
        };

        const jwtConfig = settings().getJwtConfig();
        const refreshToken = this.jwtService.sign(payload, {
            secret: jwtConfig.secret,
            expiresIn: jwtConfig.signOptions.expiresIn + 's',
        });
        return {
            refreshToken: refreshToken,
            path: '/',
            httpOnly: true,
            maxAge: Number(jwtConfig.signOptions.refreshExpiresIn) * 1000,
        };
    }

    async createUser(sid:string, email:string, studentId: string, firstName: string, lastName: string): Promise<session_userprofile> {
        const user = {
            sid: sid,
            email: email,
            first_name: firstName,
            last_name: lastName,
            date_joined: new Date(),
            student_id: studentId,
        }
        return await this.userRepository.createUser(user)
    }

    async updateUser(userId, user: Prisma.session_userprofileUpdateInput): Promise<session_userprofile>{
        return await this.userRepository.updateUser(userId, user);
    }
}