import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { PrismaModule } from '../../prisma/prisma.module';
import { AuthChain } from './auth.chain';
import { AuthConfig } from './auth.config';
import { IsPublicCommand } from './command/isPublic.command';
import { SyncApiKeyCommand } from './command/syncApiKey.command';

@Module({
  imports: [PrismaModule],
  controllers: [],
  providers: [AuthChain, IsPublicCommand, SyncApiKeyCommand, AuthConfig],
  exports: [AuthConfig, AuthChain],
})
export class AuthModule {}
