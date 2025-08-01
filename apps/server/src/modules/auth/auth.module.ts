import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { RmqModule } from '@otl/rmq'
import { ScholarUpdatePublisher } from '@otl/rmq/exchanges/scholar-sync/scholar.publish'
import { AgreementModule } from '@otl/server-nest/modules/agreement/agreement.module'
import { IsAdminCommand } from '@otl/server-nest/modules/auth/command/isAdmin.command'
import { IsReviewProhibitedCommand } from '@otl/server-nest/modules/auth/command/isReviewProhibited.command'
import { JwtHeaderCommand } from '@otl/server-nest/modules/auth/command/jwt.header.command'
import { SidHeaderCommand } from '@otl/server-nest/modules/auth/command/sid.header.command'
import { StudentIdHeaderCommand } from '@otl/server-nest/modules/auth/command/studentId.header.command'
import { LecturesService } from '@otl/server-nest/modules/lectures/lectures.service'
import { TakenLectureMQ } from '@otl/server-nest/modules/sync/domain/sync.mq'
import { SyncModule } from '@otl/server-nest/modules/sync/sync.module'

import { PrismaModule } from '@otl/prisma-client/prisma.module'

import { UserService } from '../user/user.service'
import { AuthChain } from './auth.chain'
import { AuthConfig } from './auth.config'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { IsPublicCommand } from './command/isPublic.command'
import { JwtCookieCommand } from './command/jwt.cookie.command'
import { SidCookieCommand } from './command/sid.cookie.command'
import { SyncApiKeyCommand } from './command/syncApiKey.command'
import { JwtCookieStrategy } from './strategy/jwt-cookie.strategy'

@Module({
  imports: [
    PrismaModule,
    PassportModule.register({ defaultStrategy: 'jwt-cookie' }),
    JwtModule.register({}),
    SyncModule,
    AgreementModule,
    RmqModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtCookieStrategy,
    UserService,
    LecturesService,
    AuthChain,
    IsPublicCommand,
    JwtHeaderCommand,
    SidHeaderCommand,
    StudentIdHeaderCommand,
    JwtCookieCommand,
    SidCookieCommand,
    SyncApiKeyCommand,
    IsReviewProhibitedCommand,
    IsAdminCommand,
    AuthConfig,
    {
      provide: TakenLectureMQ,
      useClass: ScholarUpdatePublisher,
    },
  ],
  exports: [AuthService, AuthConfig, AuthChain],
})
export class AuthModule {}
