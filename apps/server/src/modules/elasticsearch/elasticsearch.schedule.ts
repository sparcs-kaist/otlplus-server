import { Injectable, Logger } from '@nestjs/common'
import { Cron } from '@nestjs/schedule'
import { ElasticsearchService } from '@otl/elasticsearch-client'

@Injectable()
export class ElasticsearchSchedule {
  private readonly logger = new Logger(ElasticsearchSchedule.name)

  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  @Cron('0 2 * * *', {
    name: 'elasticsearchSync',
    timeZone: 'Asia/Seoul',
  })
  async syncCourses() {
    this.logger.log('Starting scheduled Elasticsearch sync...')
    try {
      await this.elasticsearchService.syncAllCourses()
      this.logger.log('Scheduled Elasticsearch sync completed successfully')
    }
    catch (error) {
      this.logger.error('Scheduled Elasticsearch sync failed', error)
      // Don't throw - allow cron to continue running
    }
  }
}
