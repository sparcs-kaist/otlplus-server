// eslint-disable-next-line simple-import-sort/imports
import './instrument'

import { HttpException } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'

import { HttpExceptionFilter, UnexpectedExceptionFilter } from '@otl/common/exception/exception.filter'

import { AppModule } from '../app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.useGlobalFilters(new UnexpectedExceptionFilter(), new HttpExceptionFilter<HttpException>())
  console.log('start')
  await app.listen(3000)
}
bootstrap()
