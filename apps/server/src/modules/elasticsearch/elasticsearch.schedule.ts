import { Injectable } from '@nestjs/common'
import { Cron } from '@nestjs/schedule'

import logger from '@otl/common/logger/logger'

import { ElasticsearchService } from './elasticsearch.service'

@Injectable()
export class ElasticsearchSchedule {
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  @Cron('0 2 * * *', {
    name: 'elasticsearchSync',
    timeZone: 'Asia/Seoul',
  })
  async syncCourses() {
    logger.info('Starting scheduled Elasticsearch sync...')
    try {
      await this.elasticsearchService.syncAllCourses()
      logger.info('Scheduled Elasticsearch sync completed successfully')
    }
    catch (error) {
      logger.error('Scheduled Elasticsearch sync failed', error)
    }
  }
}
