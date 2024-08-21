import dotenv from 'dotenv';
import { PrismaClientOptions } from 'prisma/prisma-client/runtime';
import { dotEnvOptions } from './dotenv-options';

dotenv.config(dotEnvOptions);
console.log(`NODE_ENV environment: ${process.env.NODE_ENV}`);
console.log(`DATABASE_URL: ${process.env.DATABASE_URL}`);

export default () => {
  return {
    ormconfig: () => getPrismaConfig(),
    ormReplicatedConfig: () => getReplicatedPrismaConfig(),
    awsconfig: () => getAWSConfig(),
    getJwtConfig: () => getJwtConfig(),
    getSsoConfig: () => getSsoConfig(),
    getCorsConfig: () => getCorsConfig(),
    getVersion: () => getVersion(),
  };
};

const getCorsConfig = () => {
  const { NODE_ENV } = process.env;
  if (NODE_ENV === 'prod') {
    return {
      origin: 'https://otl.kaist.ac.kr:5173',
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      credentials: true,
      preflightContinue: false,
      optionsSuccessStatus: 204,
    };
  } else if (NODE_ENV === 'dev') {
    console.log('dev');
    return {
      origin: 'http://3.37.146.183',
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

const getPrismaConfig = (): PrismaClientOptions => {
  return {
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
    errorFormat: 'pretty',
    log: [
      {
        emit: 'event',
        level: 'query',
      },
      {
        emit: 'stdout',
        level: 'error',
      },
      {
        emit: 'stdout',
        level: 'info',
      },
      {
        emit: 'stdout',
        level: 'warn',
      },
    ],
  };
};

const getReplicatedPrismaConfig = (): PrismaClientOptions => {
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
