import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { PrismaModule } from '../../prisma/prisma.module';
import { UserRepository } from '../../prisma/repositories/user.repository';
import { SyncModule } from '../sync/sync.module';
import { UserService } from '../user/user.service';
import { AuthChain } from './auth.chain';
import { AuthConfig } from './auth.config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { IsPublicCommand } from './command/isPublic.command';
import { JwtCommand } from './command/jwt.command';
import { SidCommand } from './command/sid.command';
import { SyncApiKeyCommand } from './command/syncApiKey.command';
import { JwtCookieStrategy } from './strategy/jwt-cookie.strategy';
import { IsReviewProhibitedCommand } from '@src/modules/auth/command/isReviewProhibited.command';
import { LecturesService } from '@src/modules/lectures/lectures.service';

@Module({
  imports: [
    PrismaModule,
    PassportModule.register({ defaultStrategy: 'jwt-cookie' }),
    JwtModule.register({}),
    SyncModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtCookieStrategy,
    UserService,
    UserRepository,
    LecturesService,
    AuthChain,
    IsPublicCommand,
    JwtCommand,
    SidCommand,
    SyncApiKeyCommand,
    IsReviewProhibitedCommand,
    AuthConfig,
  ],
  exports: [AuthService, AuthConfig, AuthChain],
})
export class AuthModule {}
