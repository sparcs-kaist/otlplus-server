import { PrismaModule } from "../../prisma/prisma.module";
import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { JwtCookieStrategy } from "./strategy/jwt-cookie.strategy";
import { UserRepository } from "../../prisma/repositories/user.repository";
import { JwtModule } from "@nestjs/jwt";
import settings from "../../settings";

@Module({
  imports: [
    PrismaModule,
    JwtModule.registerAsync({}),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtCookieStrategy,
    UserRepository,
  ],
  exports: [AuthService],
})
export class AuthModule {}
