import { Client } from '@elastic/elasticsearch'
import { Inject, Injectable, OnModuleInit } from '@nestjs/common'

import logger from '@otl/common/logger/logger'

import { PrismaReadService } from '@otl/prisma-client/prisma.read.service'

import { ELASTICSEARCH_CONFIG, ElasticsearchConfig } from './elasticsearch.config'

const COURSES_INDEX = 'courses'

interface CourseDocument {
  id: number
  title: string
  title_en: string
  title_no_space: string
  title_en_no_space: string
  old_code: string
  new_code: string
  type: string
  type_en: string
  level: string
  department_id: number
  department_name: string
  department_name_en: string
  professor_names: string[]
  professor_names_en: string[]
  summary: string | null
}

@Injectable()
export class ElasticsearchService implements OnModuleInit {
  private readonly logger = logger

  private client: Client

  private readonly indexName = COURSES_INDEX

  constructor(
    private readonly prismaRead: PrismaReadService,
    @Inject(ELASTICSEARCH_CONFIG) private readonly config: ElasticsearchConfig,
  ) {
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

  private async createIndexIfNotExists() {
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

  async indexCourse(course: CourseDocument) {
    try {
      await this.client.index({
        index: this.indexName,
        id: course.id.toString(),
        document: course,
      })
    }
    catch (error) {
      this.logger.error(`Failed to index course ${course.id}`, error)
      throw error
    }
  }

  async bulkIndexCourses(courses: CourseDocument[]) {
    if (courses.length === 0) {
      return
    }

    try {
      const body = courses.flatMap((course) => [
        { index: { _index: this.indexName, _id: course.id.toString() } },
        course,
      ])

      const response = await this.client.bulk({ refresh: true, body })
      if (response.errors) {
        const erroredDocuments: any[] = []
        response.items.forEach((action: any, i: number) => {
          const operation = Object.keys(action)[0]
          if (action[operation].error) {
            erroredDocuments.push({
              status: action[operation].status,
              error: action[operation].error,
              operation: body[i * 2],
              document: body[i * 2 + 1],
            })
          }
        })
        this.logger.error(`Bulk index errors: ${JSON.stringify(erroredDocuments)}`)
      }
      else {
        this.logger.info(`Successfully indexed ${courses.length} courses`)
      }
    }
    catch (error) {
      this.logger.error('Failed to bulk index courses', error)
      throw error
    }
  }

  async deleteCourse(courseId: number) {
    try {
      await this.client.delete({
        index: this.indexName,
        id: courseId.toString(),
      })
    }
    catch (error) {
      if (error instanceof Error && 'statusCode' in error && error.statusCode !== 404) {
        this.logger.error(`Failed to delete course ${courseId}`, error)
        throw error
      }
    }
  }

  async searchCourses(params: {
    keyword?: string
    department?: number[]
    type?: string[]
    level?: string[]
    term?: number
    offset?: number
    limit?: number
  }): Promise<number[]> {
    const {
      keyword, department, type, level, term, offset = 0, limit = 150,
    } = params

    const must: any[] = []
    const should: any[] = []

    // Keyword search
    if (keyword) {
      const keywordTrimmed = keyword.trim()
      const keywordNoSpace = keywordTrimmed.replace(/\s/g, '')
      const keywordLength = keywordTrimmed.length

      // For very short queries (1-2 characters), use prefix queries
      // This handles cases where ngram analyzer (min_gram: 2) doesn't index single characters
      // and standard analyzer tokenizes Korean as whole words
      const isVeryShortQuery = keywordLength <= 2

      if (isVeryShortQuery) {
        // Use match_phrase_prefix for analyzed text fields (works on tokens)
        // Use prefix queries for keyword fields (works on original text)
        should.push(
          // Text fields - use match_phrase_prefix (works on analyzed tokens)
          { match_phrase_prefix: { title: { query: keywordTrimmed, boost: 3.0 } } },
          { match_phrase_prefix: { title_en: { query: keywordTrimmed, boost: 3.0 } } },
          // Keyword fields - use prefix (works on original text)
          { prefix: { title_no_space: { value: keywordNoSpace, boost: 2.5 } } },
          { prefix: { title_en_no_space: { value: keywordNoSpace, boost: 2.5 } } },
          { prefix: { old_code: { value: keywordNoSpace, boost: 2.0 } } },
          { prefix: { new_code: { value: keywordNoSpace, boost: 2.0 } } },
          // Text fields - use match_phrase_prefix
          { match_phrase_prefix: { department_name: { query: keywordTrimmed, boost: 1.5 } } },
          { match_phrase_prefix: { department_name_en: { query: keywordTrimmed, boost: 1.5 } } },
          { match_phrase_prefix: { professor_names: { query: keywordTrimmed, boost: 1.0 } } },
          { match_phrase_prefix: { professor_names_en: { query: keywordTrimmed, boost: 1.0 } } },
          { match_phrase_prefix: { summary: { query: keywordTrimmed, boost: 0.5 } } },
        )
      }
      else {
        // For longer queries, use match queries with fuzzy matching for typos
        // Elasticsearch automatically prefers exact matches over fuzzy matches
        // Exact matches score higher, fuzzy matches (typos) score lower but still match
        should.push(
          // Title fields (highest priority) - with fuzzy matching for typos
          { match: { title: { query: keywordTrimmed, fuzziness: 'AUTO', boost: 3.0 } } },
          { match: { title_en: { query: keywordTrimmed, fuzziness: 'AUTO', boost: 3.0 } } },
          { match: { title_no_space: { query: keywordNoSpace, boost: 2.5 } } },
          { match: { title_en_no_space: { query: keywordNoSpace, boost: 2.5 } } },
          // Course codes (no fuzzy - exact match only)
          { match: { old_code: { query: keywordNoSpace, boost: 2.0 } } },
          { match: { new_code: { query: keywordNoSpace, boost: 2.0 } } },
          // Department names - with fuzzy matching for typos
          { match: { department_name: { query: keywordTrimmed, fuzziness: 'AUTO', boost: 1.5 } } },
          { match: { department_name_en: { query: keywordTrimmed, fuzziness: 'AUTO', boost: 1.5 } } },
          // Professor names - with fuzzy matching for typos
          { match: { professor_names: { query: keywordTrimmed, fuzziness: 'AUTO', boost: 1.0 } } },
          { match: { professor_names_en: { query: keywordTrimmed, fuzziness: 'AUTO', boost: 1.0 } } },
          // Summary - with fuzzy matching for typos
          { match: { summary: { query: keywordTrimmed, fuzziness: 'AUTO', boost: 0.5 } } },
        )
      }
    }

    // Department filter
    if (department && department.length > 0) {
      must.push({
        terms: {
          department_id: department,
        },
      })
    }

    // Type filter
    if (type && type.length > 0 && !type.includes('ALL')) {
      if (type.includes('ETC')) {
        // ETC means all types except the selected ones
        const selectedTypes = type.filter((t) => t !== 'ETC')
        const typeEnMap: Record<string, string> = {
          GR: 'General Required',
          MGC: 'Mandatory General Courses',
          BE: 'Basic Elective',
          BR: 'Basic Required',
          EG: 'Elective(Graduate)',
          HSE: 'Humanities & Social Elective',
          OE: 'Other Elective',
          ME: 'Major Elective',
          MR: 'Major Required',
        }
        const excludedTypes = selectedTypes.map((t) => typeEnMap[t]).filter(Boolean)
        must.push({
          bool: {
            must_not: {
              terms: {
                type_en: excludedTypes,
              },
            },
          },
        })
      }
      else {
        const typeEnMap: Record<string, string> = {
          GR: 'General Required',
          MGC: 'Mandatory General Courses',
          BE: 'Basic Elective',
          BR: 'Basic Required',
          EG: 'Elective(Graduate)',
          HSE: 'Humanities & Social Elective',
          OE: 'Other Elective',
          ME: 'Major Elective',
          MR: 'Major Required',
        }
        const typeEnValues = type.map((t) => typeEnMap[t]).filter(Boolean)
        must.push({
          terms: {
            type_en: typeEnValues,
          },
        })
      }
    }

    // Level filter
    if (level && level.length > 0 && !level.includes('ALL')) {
      if (level.includes('ETC')) {
        const selectedLevels = level.filter((l) => l !== 'ETC').map((l) => l[0])
        must.push({
          bool: {
            must_not: {
              terms: {
                level: selectedLevels,
              },
            },
          },
        })
      }
      else {
        const levelDigits = level.map((l) => l[0])
        must.push({
          terms: {
            level: levelDigits,
          },
        })
      }
    }

    // Term filter (for courses with lectures in recent years)
    if (term) {
      // const currentYear = new Date().getFullYear()
      // const minYear = currentYear - term
      // Note: We can't filter by lecture year directly in ES without denormalizing
      // For now, we'll need to handle this in the application layer or add year info to the index
      // This is a limitation - we'll need to fetch and filter in the app or add lecture data to the index
    }

    const query: any = {}

    if (must.length > 0 || should.length > 0) {
      query.bool = {}
      if (must.length > 0) {
        query.bool.must = must
      }
      if (should.length > 0) {
        query.bool.should = should
        query.bool.minimum_should_match = keyword ? 1 : 0
      }
    }
    else {
      query.match_all = {}
    }

    try {
      const response = await this.client.search({
        index: this.indexName,
        body: {
          query,
          size: limit,
          from: offset,
          /* eslint no-underscore-dangle: ["error", { "allow": ["_source"] }] */
          _source: ['id'],
        },
      })
      return response.hits.hits.map((hit: any) => hit._source.id)
    }
    catch (error) {
      this.logger.error('Failed to search courses', error)
      throw error
    }
  }

  async syncAllCourses() {
    this.logger.info('Starting full course sync to Elasticsearch...')

    try {
      // Fetch all courses with related data
      const courses = await this.prismaRead.subject_course.findMany({
        select: {
          id: true,
          title: true,
          title_en: true,
          title_no_space: true,
          title_en_no_space: true,
          old_code: true,
          new_code: true,
          type: true,
          type_en: true,
          level: true,
          department_id: true,
          summury: true,
          subject_department: {
            select: {
              name: true,
              name_en: true,
            },
          },
          subject_course_professors: {
            select: {
              professor: {
                select: {
                  professor_name: true,
                  professor_name_en: true,
                },
              },
            },
          },
        },
      })

      const documents: CourseDocument[] = courses.map((course) => ({
        id: course.id,
        title: course.title || '',
        title_en: course.title_en || '',
        title_no_space: course.title_no_space || '',
        title_en_no_space: course.title_en_no_space || '',
        old_code: course.old_code || '',
        new_code: course.new_code || '',
        type: course.type || '',
        type_en: course.type_en || '',
        level: course.level || '',
        department_id: course.department_id,
        department_name: course.subject_department?.name || '',
        department_name_en: course.subject_department?.name_en || '',
        professor_names: course.subject_course_professors.map((cp) => cp.professor.professor_name || ''),
        professor_names_en: course.subject_course_professors.map((cp) => cp.professor.professor_name_en || ''),
        summary: course.summury,
      }))

      // Delete existing index and recreate
      const exists = await this.client.indices.exists({ index: this.indexName })
      if (exists) {
        await this.client.indices.delete({ index: this.indexName })
        this.logger.info(`Deleted existing index: ${this.indexName}`)
      }
      await this.createIndexIfNotExists()

      // Bulk index in batches
      const batchSize = 1000
      for (let i = 0; i < documents.length; i += batchSize) {
        const batch = documents.slice(i, i + batchSize)
        await this.bulkIndexCourses(batch)
        this.logger.info(`Indexed batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(documents.length / batchSize)}`)
      }

      this.logger.info(`Successfully synced ${documents.length} courses to Elasticsearch`)
    }
    catch (error) {
      this.logger.error('Failed to sync courses to Elasticsearch', error)
      throw error
    }
  }

  async getClient(): Promise<Client> {
    return this.client
  }
}
