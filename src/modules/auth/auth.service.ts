import { PrismaService } from "../../prisma/prisma.service";
import { Injectable } from "@nestjs/common";
import { UserRepository } from "../../prisma/repositories/user.repository";
import { session_userprofile } from "@prisma/client";
import { JwtService } from "@nestjs/jwt";
import settings from "../../settings";

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
}