import { ValidationPipe, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import { AppModule } from '../app.module';
import settings from '../settings';
import morgan = require('morgan');
import { LoggingInterceptor } from '@src/common/middleware/http.logging.middleware';
import { HttpExceptionFilter } from '@src/common/filter/http.exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableVersioning({
    type: VersioningType.URI,
  });
  app.enableCors(settings().getCorsConfig());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      // forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.use(
    session({
      secret: 'p@ssw0rd',
      resave: false,
      saveUninitialized: false,
    }),
  );
  app.use(cookieParser());
  // Logs requests
  // app.use(
  //   morgan(':method :url OS/:req[client-os] Ver/:req[client-api-version]', {
  //     // https://github.com/expressjs/morgan#immediate
  //     immediate: true,
  //     stream: {
  //       write: (message) => {
  //         console.info(message.trim());
  //       },
  //     },
  //   }),
  // );

  // Logs responses
  app.use(
    morgan(':method :url :status :res[content-length] :response-time ms', {
      stream: {
        write: (message) => {
          console.info(message.trim());
        },
      },
    }),
  );

  app.useGlobalInterceptors(new LoggingInterceptor());
  app.useGlobalFilters(new HttpExceptionFilter());
  app.enableShutdownHooks();
  return app.listen(8080);
}

bootstrap()
  .then(() => console.log('Nest Ready'))
  .catch((error) => console.log(error));
