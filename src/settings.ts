import dotenv from 'dotenv';
import { dotEnvOptions } from './dotenv-options';
import { PrismaClientOptions } from 'prisma/prisma-client/runtime';
dotenv.config(dotEnvOptions);
console.log(`Execution environment: ${process.env.EXEC_ENV}`);

export default () => {
  return {
    ormconfig: () => getPrismaConfig(),
    ormReplicatedConfig: () => getReplicatedPrismaConfig(),
    awsconfig: () => getAWSConfig(),
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
