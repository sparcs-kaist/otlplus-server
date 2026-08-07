import path from 'path'
import winston, { createLogger, format, transports } from 'winston'
import DailyRotateFileTransport from 'winston-daily-rotate-file'

// 실행 중인 앱의 루트 경로를 기준으로 logs 폴더 경로 설정
const logDir = path.join(process.cwd(), 'logs')

const baseFormat = format.combine(
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss(UTCZ)' }),
  format.errors({ stack: true }),
  format.splat(),
  format.json(),
)

const finalFormat = format.printf(
  ({
    level, message, timestamp, stack,
  }) => `${timestamp} [${level}]: ${message} ${level === 'error' && stack ? stack : ''}`,
)

const uncolorizedFormat = format.combine(baseFormat, format.uncolorize(), finalFormat)
const colorizedFormat = format.combine(baseFormat, format.colorize({ all: true }), finalFormat)

const { NODE_ENV } = process.env
const datePattern = 'YYYY-MM-DD-HH'
const maxSize = 5 * 1024 * 1024

// eslint-disable-next-line import/no-mutable-exports
let logger: winston.Logger
if (NODE_ENV === 'prod') {
  logger = createLogger({
    level: 'info',
    format: uncolorizedFormat,
    defaultMeta: { service: 'otlplus' },
    transports: [
      new DailyRotateFileTransport({
        level: 'info',
        filename: path.join(logDir, '%DATE%-combined.log'),
        datePattern,
        maxSize,
      }),
      new DailyRotateFileTransport({
        level: 'error',
        filename: path.join(logDir, '%DATE%-error.log'),
        datePattern,
        maxSize,
      }),
      new transports.Console({ level: 'error' }),
    ],
    exceptionHandlers: [
      new DailyRotateFileTransport({
        filename: path.join(logDir, '%DATE%-unhandled.log'),
        datePattern,
        maxSize,
      }),
      new transports.Console(),
    ],
  })
}
else if (NODE_ENV === 'dev') {
  logger = createLogger({
    level: 'debug',
    format: uncolorizedFormat,
    defaultMeta: { service: 'otlplus' },
    transports: [
      new DailyRotateFileTransport({
        level: 'info',
        filename: path.join(logDir, '%DATE%-combined.log'),
        datePattern,
        maxSize,
      }),
      new DailyRotateFileTransport({
        level: 'error',
        filename: path.join(logDir, '%DATE%-error.log'),
        datePattern,
        maxSize,
      }),
      new transports.Console({ level: 'error' }),
      new transports.Console({ level: 'debug', format: colorizedFormat }),
    ],
    exceptionHandlers: [
      new DailyRotateFileTransport({
        filename: path.join(logDir, '%DATE%-unhandled.log'),
        datePattern,
        maxSize,
      }),
      new transports.Console({ format: colorizedFormat }),
    ],
  })
}
else {
  logger = createLogger({
    level: 'debug',
    format: colorizedFormat,
    defaultMeta: { service: 'otlplus' },
    transports: [new transports.Console()],
    exceptionHandlers: [new transports.Console()],
  })
}

export default logger
