import type { INestApplication } from '@nestjs/common'
import type { NextFunction, Request, Response } from 'express'
import { json } from 'express'

export function useLargeSyncBodyParser(app: INestApplication): void {
  const parser = json({ limit: '50mb' })
  const syncJsonBodyParser = (request: Request, response: Response, next: NextFunction) => {
    parser(request, response, next)
  }
  app.use('/api/sync', syncJsonBodyParser)
}
