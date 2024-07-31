import dotenv from 'dotenv';
import { PrismaClientOptions } from 'prisma/prisma-client/runtime';
import { dotEnvOptions } from './dotenv-options';
import { DocumentBuilder } from '@nestjs/swagger';

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
    getSwaggerConfig: () => getSwaggerConfig(),
  };
};

const getCorsConfig = () => {
  const { NODE_ENV } = process.env;
  if (NODE_ENV === 'local') {
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

const getSwaggerConfig = () => {
  const config = new DocumentBuilder()
    .setTitle('OTLPlus-server')
    .setDescription('The OTL-server API description')
    .setVersion('1.0')
    .build();
  return config;
};
