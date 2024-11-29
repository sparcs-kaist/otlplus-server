import { Prisma } from '@prisma/client';
import dotenv from 'dotenv';
import { dotEnvOptions } from './dotenv-options';

dotenv.config(dotEnvOptions);
console.log(`NODE_ENV environment: ${process.env.NODE_ENV}`);

export default () => {
  return {
    ormconfig: () => getPrismaConfig(),
    ormReplicatedConfig: () => getReplicatedPrismaConfig(),
    awsconfig: () => getAWSConfig(),
    getJwtConfig: () => getJwtConfig(),
    getSsoConfig: () => getSsoConfig(),
    getCorsConfig: () => getCorsConfig(),
    getVersion: () => getVersion(),
    getStaticConfig: () => staticConfig(),
  };
};

const getCorsConfig = () => {
  const { NODE_ENV } = process.env;
  if (NODE_ENV === 'prod') {
    return {
      origin: [
        'https://otl.kaist.ac.kr',
        'http://otl.kaist.ac.kr',
        'https://otl.sparcs.org',
        'http://otl.sparcs.org',
      ],
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      credentials: true,
      preflightContinue: false,
      optionsSuccessStatus: 204,
    };
  } else if (NODE_ENV === 'dev') {
    return {
      origin: ['https://otl.dev.sparcs.org', 'http://localhost:5173'],
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      credentials: true,
      preflightContinue: false,
      optionsSuccessStatus: 204,
    };
  } else {
    return {
      origin: 'http://localhost:5173',
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
      //   emit: 'event',
      //   level: 'query',
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

const getReplicatedPrismaConfig = (): Prisma.PrismaClientOptions => {
  return {};
};

const getAWSConfig = () => {
  return {};
};

const getJwtConfig = () => {
  return {
    secret: process.env.JWT_SECRET,
    signOptions: {
      expiresIn: process.env.EXPIRES_IN,
      refreshExpiresIn: process.env.REFRESH_EXPIRES_IN,
    },
  };
};

const getSsoConfig = (): any => {
  return {
    ssoIsBeta: process.env.SSO_IS_BETA === 'false' ? false : true,
    ssoClientId: process.env.SSO_CLIENT_ID,
    ssoSecretKey: process.env.SSO_SECRET_KEY,
  };
};

const getVersion = () => {
  return String(process.env.npm_package_version);
};

const staticConfig = (): any => {
  return {
    file_path:
      process.env.DOCKER_DEPLOY === 'true'
        ? '/var/www/otlplus-server/static/'
        : 'static/',
  };
};
