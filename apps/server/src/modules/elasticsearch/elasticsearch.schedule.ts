import { Injectable } from '@nestjs/common'
import { Cron } from '@nestjs/schedule'
import { ElasticsearchService } from '@otl/elasticsearch-client'

import logger from '@otl/common/logger/logger'

@Injectable()
export class ElasticsearchSchedule {
  private readonly logger = logger

  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  @Cron('0 2 * * *', {
    name: 'elasticsearchSync',
    timeZone: 'Asia/Seoul',
  })
  async syncCourses() {
    this.logger.info('Starting scheduled Elasticsearch sync...')
    try {
      await this.elasticsearchService.syncAllCourses()
      this.logger.info('Scheduled Elasticsearch sync completed successfully')
    }
    catch (error) {
      this.logger.error('Scheduled Elasticsearch sync failed', error)
    }
  }
}
