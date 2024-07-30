import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { PrismaModule } from '../../prisma/prisma.module';
import { UserRepository } from '../../prisma/repositories/user.repository';
import { UserService } from '../user/user.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtCookieStrategy } from './strategy/jwt-cookie.strategy';
import { AuthChain } from './auth.chain';
import { IsPublicCommand } from './command/isPublic.command';
import { JwtCommand } from './command/jwt.command';
import { SidCommand } from './command/sid.command';

@Module({
  imports: [
    PrismaModule,
    PassportModule.register({ defaultStrategy: 'jwt-cookie' }),
    JwtModule.register({}),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtCookieStrategy,
    UserService,
    UserRepository,
    AuthChain,
    IsPublicCommand,
    JwtCommand,
    SidCommand,
  ],
  exports: [AuthService],
})
export class AuthModule {}
