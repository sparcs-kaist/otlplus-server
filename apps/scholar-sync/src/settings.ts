import { Prisma } from '@prisma/client';
import dotenv from 'dotenv';
import { dotEnvOptions } from './dotenv-options';
import { DocumentBuilder } from '@nestjs/swagger';

dotenv.config(dotEnvOptions);
console.log(`NODE_ENV environment: ${process.env.NODE_ENV}`);

export default () => {
  return {
    ormconfig: () => getPrismaConfig(),
    getCorsConfig: () => getCorsConfig(),
    syncConfig: () => getSyncConfig(),
    getVersion: () => getVersion(),
    getSwaggerConfig: () => getSwaggerConfig(),
  };
};

const getCorsConfig = () => {
  const { NODE_ENV } = process.env;
  if (NODE_ENV === 'prod') {
    return {
      origin: ['https://otl-sync.sparcs.org', 'http://otl-sync.sparcs.org'],
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      credentials: true,
      preflightContinue: false,
      optionsSuccessStatus: 204,
    };
  } else if (NODE_ENV === 'dev') {
    return {
      origin: ['https://otl-sync.dev.sparcs.org', 'http://localhost:9000'],
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      credentials: true,
      preflightContinue: false,
      optionsSuccessStatus: 204,
    };
  } else {
    return {
      origin: 'http://localhost:9000',
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      credentials: true,
      preflightContinue: false,
      optionsSuccessStatus: 204,
    };
  }
};

const getPrismaConfig = (): Prisma.PrismaClientOptions => {
  return {
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
    errorFormat: 'pretty',
    log: [
      // {
      //  emit: 'event',
      //  level: 'query',
      // },
      {
        emit: 'stdout',
        level: 'error',
      },
      {
        emit: 'stdout',
        level: 'info',
      },
      // {
      //   emit: 'stdout',
      //   level: 'warn',
      // },
    ],
  };
};

const getSyncConfig = () => {
  return {
    slackKey: process.env.SLACK_KEY,
    scholarKey: process.env.SCHOLAR_AUTH_KEY,
    scholarUrl: process.env.SCHOLAR_BASE_URL,
  };
};

const getVersion = () => {
  return String(process.env.npm_package_version);
};

const getSwaggerConfig = () => {
  const config = new DocumentBuilder()
    .setTitle('OTLPlus-server')
    .setDescription('The OTL-server API description')
    .setVersion('1.0')
    .build();
  return config;
};
