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

let cachedServer: Server;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);


  app.enableVersioning({
    type: VersioningType.URI
  });
  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true
    })
  );

  app.use(
    session({
      secret: 'sessionid',
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


  // if (NODE_ENV === "local" || NODE_ENV === "sandbox") {
  //   app.useGlobalGuards(new MockAuthGuard(new Reflector()));
  // } else {
  //   app.useGlobalGuards(new AuthGuard(new Reflector()));
  // }

  // if (!IS_PRODUCTION) {
  //   const options = new DocumentBuilder()
  //     .setTitle('CLASSUM API V3')
  //     .setDescription('classum 서비스를 위한 api 문서입니다.')
  //     .setVersion('3.0')
  //     .addBasicAuth()
  //     .build()
  //   const document = SwaggerModule.createDocument(app, options)
  //   SwaggerModule.setup('docs', app, document)
  // }
  const prismaService = app.get(PrismaService);
  await prismaService.enableShutdownHooks(app)
  return app.listen(3000);
}

bootstrap()
  .then(() => console.log("Nest Ready"))
  .catch(error => console.log(error));
