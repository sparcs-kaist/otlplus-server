import { Client } from '@elastic/elasticsearch'
import { Inject, Injectable, OnModuleInit } from '@nestjs/common'

import logger from '@otl/common/logger/logger'

import { ELASTICSEARCH_CONFIG, ElasticsearchConfig } from './elasticsearch.config'
import { COURSES_INDEX } from './types/course'

@Injectable()
export class ElasticsearchService implements OnModuleInit {
  private readonly logger = logger

  private client: Client

  private readonly indexName = COURSES_INDEX

  constructor(@Inject(ELASTICSEARCH_CONFIG) private readonly config: ElasticsearchConfig) {
    // TODO: do we really need to set this? maybe we can just use the default client
    // Also there is builtin config type = ClientOptions for this; remove ElasticsearchConfig
    this.client = new Client({
      node: config.node,
      auth: config.auth
        ? {
          username: config.auth.username,
          password: config.auth.password,
        }
        : undefined,
      tls: config.tls
        ? {
          rejectUnauthorized: false,
        }
        : undefined,
    })
  }

  async onModuleInit() {
    try {
      await this.createIndexIfNotExists()
      this.logger.info('Elasticsearch index initialized successfully')
    }
    catch (error) {
      this.logger.error('Failed to initialize Elasticsearch index', error)
    }
  }

  // we index each course as a document but only select some of the fields
  // this is because to return more relevant results without potential noises
  async createIndexIfNotExists() {
    const exists = await this.client.indices.exists({ index: this.indexName })

    if (!exists) {
      await this.client.indices.create({
        index: this.indexName,
        body: {
          mappings: {
            properties: {
              id: { type: 'integer' },
              title: {
                type: 'text',
                analyzer: 'standard',
                fields: {
                  keyword: { type: 'keyword' },
                  ngram: {
                    type: 'text',
                    analyzer: 'ngram_analyzer',
                  },
                },
              },
              title_en: {
                type: 'text',
                analyzer: 'standard',
                fields: {
                  keyword: { type: 'keyword' },
                  ngram: {
                    type: 'text',
                    analyzer: 'ngram_analyzer',
                  },
                },
              },
              title_no_space: {
                type: 'text',
                analyzer: 'keyword',
                fields: {
                  keyword: { type: 'keyword' },
                },
              },
              title_en_no_space: {
                type: 'text',
                analyzer: 'keyword',
                fields: {
                  keyword: { type: 'keyword' },
                },
              },
              old_code: {
                type: 'text',
                analyzer: 'keyword',
                fields: {
                  keyword: { type: 'keyword' },
                },
              },
              new_code: {
                type: 'text',
                analyzer: 'keyword',
                fields: {
                  keyword: { type: 'keyword' },
                },
              },
              type: { type: 'keyword' },
              type_en: { type: 'keyword' },
              level: { type: 'keyword' },
              department_id: { type: 'integer' },
              department_name: {
                type: 'text',
                analyzer: 'standard',
                fields: {
                  keyword: { type: 'keyword' },
                },
              },
              department_name_en: {
                type: 'text',
                analyzer: 'standard',
                fields: {
                  keyword: { type: 'keyword' },
                },
              },
              professor_names: {
                type: 'text',
                analyzer: 'standard',
                fields: {
                  keyword: { type: 'keyword' },
                },
              },
              professor_names_en: {
                type: 'text',
                analyzer: 'standard',
                fields: {
                  keyword: { type: 'keyword' },
                },
              },
              summary: {
                type: 'text',
                analyzer: 'standard',
              },
            },
          },
          settings: {
            analysis: {
              analyzer: {
                ngram_analyzer: {
                  type: 'custom',
                  tokenizer: 'standard',
                  filter: ['lowercase', 'ngram_filter'],
                },
              },
              filter: {
                ngram_filter: {
                  type: 'ngram',
                  min_gram: 2,
                  max_gram: 3,
                },
              },
            },
          },
        },
      })
      this.logger.info(`Created Elasticsearch index: ${this.indexName}`)
    }
  }

  getClient(): Client {
    return this.client
  }
}
