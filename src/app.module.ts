import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from "./prisma/prisma.module";
import { APP_GUARD } from "@nestjs/core";
import { JwtCookieStrategy } from "./modules/auth/strategy/jwt-cookie.strategy";

@Module({
  imports: [PrismaModule],
  controllers: [AppController],
  providers: [    {
    provide: APP_GUARD,
    useExisting: JwtCookieStrategy,
  },AppService],
})
export class AppModule {}
