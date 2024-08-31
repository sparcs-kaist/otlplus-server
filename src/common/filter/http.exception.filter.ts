import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import * as winston from 'winston';
import 'winston-daily-rotate-file';
import { v4 as uuidv4 } from 'uuid';

// JSON 포맷을 커스터마이징하여 메시지와 속성 순서를 설정
const customFormat = winston.format.printf(({ message }) => {
  return JSON.stringify(message);
});

// 파일 핸들러 설정
const fileTransport = new winston.transports.DailyRotateFile({
  filename: 'logs/response-%DATE%.log', // 파일 이름 패턴
  datePattern: 'YYYY-MM-DD', // 날짜 패턴
  zippedArchive: true, // 압축 여부
  maxSize: '10m', // 파일 최대 크기
  maxFiles: '10d', // 백업 파일 수
  handleExceptions: true, // 예외 처리
  format: winston.format.combine(customFormat),
});

const logger = winston.createLogger({
  transports: [fileTransport],
  exitOnError: false, // 예외 발생 시 프로세스 종료하지 않음
});

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();
    const status = exception.getStatus
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const startTime = Date.now();
    const requestId = request.headers['uuid'];

    const { method, headers, query } = request;

    // 요청 데이터 처리
    let requestData = {};
    try {
      if (method === 'GET') {
        requestData = { ...query };
      } else if (method === 'POST') {
        requestData = { ...request.body };
      } else {
        requestData = { ...request.body };
      }
    } catch (error) {
      requestData = {}; // 예외 발생 시 빈 객체로 처리
    }
    const requestLog = {
      method,
      path: request.path, // URI만 포함하도록 수정
      UUID: requestId,
      data: requestData,
      user: request?.user?.sid ?? '',
      // meta,
    };

    // 예외 로그 기록
    const errorResponseLog = {
      status: status,
      data: response?.body ?? '',
    };

    // 전체 로그 객체
    const logData = {
      request: requestLog,
      response: errorResponseLog,
    };

    // 로그 출력
    logger.error(logData);

    // 응답 생성
    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
