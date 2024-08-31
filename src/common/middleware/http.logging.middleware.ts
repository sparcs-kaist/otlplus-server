import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { v4 as uuidv4 } from 'uuid';
import * as winston from 'winston';
import 'winston-daily-rotate-file';

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

export const logger = winston.createLogger({
  transports: [fileTransport],
  exitOnError: false, // 예외 발생 시 프로세스 종료하지 않음
});

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const res = context.switchToHttp().getResponse();

    const startTime = Date.now();
    const requestId = req.headers['uuid'];

    const { method, headers, query } = req;

    // 요청 데이터 처리
    let requestData = {};
    try {
      if (method === 'GET') {
        requestData = { ...query };
      } else if (method === 'POST') {
        requestData = { ...req.body };
      } else {
        requestData = { ...req.body };
      }
    } catch (error) {
      requestData = {}; // 예외 발생 시 빈 객체로 처리
    }

    const meta = {
      tz: new Date().toLocaleString('en-US', {
        timeZone: 'Asia/Seoul',
        timeZoneName: 'short',
      }),
      remote_host: req.hostname,
      content_length: headers['content-length'] || '',
      path_info: req.path,
      remote_addr: req.ip,
      content_type: headers['content-type'] || '',
      http_host: headers['host'] || '',
      http_user_agent: headers['user-agent'] || '',
    };

    const requestLog = {
      method,
      path: req.path, // URI만 포함하도록 수정
      UUID: requestId,
      data: requestData,
      user: req?.user?.sid ?? '',
      // meta,
    };

    return next.handle().pipe(
      tap((responseBody) => {
        res.on('finish', () => {
          const duration = Date.now() - startTime;
          const { statusCode } = res;

          const responseLog = {
            status: statusCode,
            // headers: {
            //   'Content-Type': res.getHeader('Content-Type') || '',
            //   // ...res.getHeaders(), // 모든 응답 헤더를 포함
            // },
            // charset: res.charset || 'utf-8',
            data: responseBody, // Response Body 저장
          };

          // request와 response를 하나의 객체로 묶어서 로깅
          const logData = {
            request: requestLog,
            response: responseLog,
            duration: duration,
          };

          logger.info(logData);
        });
      }),
      catchError((err) => {
        res.on('finish', () => {
          const duration = Date.now() - startTime;
          const statusCode =
            err instanceof HttpException
              ? err.getStatus()
              : HttpStatus.INTERNAL_SERVER_ERROR;

          const errorResponseLog = {
            status: statusCode,
            headers: {
              'Content-Type': res.getHeader('Content-Type') || '',
              ...res.getHeaders(), // 모든 응답 헤더를 포함
            },
            charset: res.charset || 'utf-8',
            data: {
              message: err.message || 'Internal Server Error',
              stack: err.stack || '', // Stack trace 포함 (원하는 경우)
            },
            duration: `${duration}ms`,
          };

          // 예외 발생 시에도 request는 그대로 남기고, error response를 로깅
          const logData = {
            request: requestLog,
            response: errorResponseLog,
          };

          logger.error(logData);
        });

        return throwError(() => err);
      }),
    );
  }
}
