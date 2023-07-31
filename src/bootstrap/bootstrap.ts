import { ValidationPipe, VersioningType } from "@nestjs/common";
import { HttpAdapterHost, NestFactory, Reflector } from "@nestjs/core";
import { ExpressAdapter } from "@nestjs/platform-express";
import express from "express";
import { Server } from "http";
import { AppModule } from "../app.module";
// import { AuthGuard, MockAuthGuard } from '../../common/guards/auth.guard'
import morgan = require("morgan");
import { PrismaService } from "../prisma/prisma.service";
import cookieParser from "cookie-parser";
import session from "express-session";
import { MockAuthGuard } from "../modules/auth/guard/mock-auth-guard";
import { JwtCookieGuard } from "../modules/auth/guard/jwt-cookie.guard";
import settings from "../settings";

let cachedServer: Server;

async function bootstrap() {
  const {NODE_ENV} = process.env;

  const app = await NestFactory.create(AppModule);

  app.enableVersioning({
    type: VersioningType.URI
  });
  app.enableCors(settings().getCorsConfig());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true
    })
  );

  app.use(
    session({
      secret: 'p@ssw0rd',
      resave: false,
      saveUninitialized: false,
    })
  )
  app.use(cookieParser());
  // Logs requests
  app.use(
    morgan(":method :url OS/:req[client-os] Ver/:req[client-api-version]", {
      // https://github.com/expressjs/morgan#immediate
      immediate: true,
      stream: {
        write: message => {
          console.info(message.trim());
        }
      }
    })
  );

  // Logs responses
  app.use(
    morgan(":method :url :status :res[content-length] :response-time ms", {
      stream: {
        write: message => {
          console.info(message.trim());
        }
      }
    })
  );

  const prismaService = app.get(PrismaService);
  await prismaService.enableShutdownHooks(app)
  return app.listen(8000);
}

bootstrap()
  .then(() => console.log("Nest Ready"))
  .catch(error => console.log(error));
