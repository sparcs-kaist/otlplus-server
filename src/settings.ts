import dotenv from 'dotenv';
import { dotEnvOptions } from './dotenv-options';
import { PrismaClientOptions } from 'prisma/prisma-client/runtime';
import { JwtModuleOptions, JwtOptionsFactory } from '@nestjs/jwt';

dotenv.config(dotEnvOptions);
console.log(`NODE_ENV environment: ${process.env.NODE_ENV}`);
console.log(`DATABASE_URL: ${process.env.DATABASE_URL}`);

export default () => {
  return {
    ormconfig: () => getPrismaConfig(),
    ormReplicatedConfig: () => getReplicatedPrismaConfig(),
    awsconfig: () => getAWSConfig(),
    getJwtConfig: () => getJwtConfig(),
  };
};

const getPrismaConfig = (): PrismaClientOptions => {
  return {
    datasources: {
      db:{
        url: process.env.DATABASE_URL,
      }
    },
    errorFormat: 'pretty',
    log: [`query`,`error`],
  }
}

const getReplicatedPrismaConfig = (): PrismaClientOptions => {
  return {

  }
}

const getAWSConfig = () => {
  return {

  }
}

const getJwtConfig = ():JwtModuleOptions => {
  return {
    secret: process.env.ACCESS_SECRET,
    signOptions: {
      expiresIn: process.env.EXPIRES_IN,
    },
  }
}
