import { Inject, Injectable, OnModuleInit } from '@nestjs/common'
import {
  DEPARTMENT_SCHEMA, FIELD_SCHEMA, LAB_SCHEMA, PAPER_SCHEMA, PROFESSOR_SCHEMA,
} from '@otl/weaviate-client/types'
import {
  Collection, ConnectToCustomOptions, dataType, WeaviateClient,
} from 'weaviate-client'

import { createWeaviateClient } from './weaviate.factory'

@Injectable()
export class WeaviateService implements OnModuleInit {
  public client!: WeaviateClient

  constructor(
    @Inject('ConnectToCustomOptions')
    private readonly config: ConnectToCustomOptions,
  ) {}

  async onModuleInit() {
    this.client = await createWeaviateClient(this.config)
    await this.initSchema()
  }

  private paperCollection!: Collection<undefined, symbol, undefined> | Collection<undefined, string, undefined>

  private fieldCollection!: Collection<undefined, symbol, undefined> | Collection<undefined, string, undefined>

  private departmentCollection!: Collection<undefined, symbol, undefined> | Collection<undefined, string, undefined>

  private professorCollection!: Collection<undefined, symbol, undefined> | Collection<undefined, string, undefined>

  private labCollection!: Collection<undefined, symbol, undefined> | Collection<undefined, string, undefined>

  get paper() {
    return this.paperCollection
  }

  get field() {
    return this.fieldCollection
  }

  get department() {
    return this.departmentCollection
  }

  get professor() {
    return this.professorCollection
  }

  get lab() {
    return this.labCollection
  }

  async initSchema() {
    this.paperCollection = await this.paperSchema()
    this.fieldCollection = await this.fieldSchema()
    this.labCollection = await this.labSchema()
    this.departmentCollection = await this.departmentSchema()
    this.professorCollection = await this.professorSchema()
  }

  private async paperSchema() {
    const name = PAPER_SCHEMA

    const exists = await this.client.collections.exists(name)
    if (!exists) {
      return await this.client.collections.create({
        name,
        properties: [
          {
            name: 'title',
            dataType: dataType.TEXT,
            tokenization: 'word',
            indexSearchable: true,
            indexFilterable: true,
          },
          {
            name: 'abstract',
            dataType: dataType.TEXT,
            tokenization: 'word',
            indexSearchable: true,
          },

          // 참조 & 배열: 필터링 대비
          { name: 'professor', dataType: dataType.UUID, indexFilterable: true },
          { name: 'fields', dataType: dataType.UUID_ARRAY, indexFilterable: true },

          // 식별자/저널 메타: 보통 동치/집계 필터 위주
          { name: 'doi', dataType: dataType.TEXT, indexFilterable: true },
          { name: 'publicationName', dataType: dataType.TEXT, indexFilterable: true },
          { name: 'issn', dataType: dataType.TEXT, indexFilterable: true },
          { name: 'eIssn', dataType: dataType.TEXT, indexFilterable: true },
          { name: 'sourceId', dataType: dataType.TEXT, indexFilterable: true },
          { name: 'aggregationType', dataType: dataType.TEXT, indexFilterable: true },
          { name: 'volume', dataType: dataType.TEXT, indexFilterable: true },
          { name: 'issueIdentifier', dataType: dataType.TEXT, indexFilterable: true },

          // 날짜/숫자: 범위 필터링
          {
            name: 'coverDate',
            dataType: dataType.DATE,
            indexFilterable: true,
            indexRangeFilters: true,
          },
          {
            name: 'publishYear',
            dataType: dataType.INT,
            indexFilterable: true,
            indexRangeFilters: true,
          },
          {
            name: 'publishMonth',
            dataType: dataType.INT,
            indexFilterable: true,
            indexRangeFilters: true,
          },
          {
            name: 'citedByCount',
            dataType: dataType.INT,
            indexFilterable: true,
            indexRangeFilters: true,
          },

          // 표시용 텍스트: 검색 필요시만 Searchable
          {
            name: 'coverDisplayDate',
            dataType: dataType.TEXT,
            indexSearchable: false,
            indexFilterable: true,
          },
          { name: 'xmlLink', dataType: dataType.TEXT },
          { name: 'pdfLink', dataType: dataType.TEXT },
          { name: 'articleNumber', dataType: dataType.TEXT },
          { name: 'pageRange', dataType: dataType.TEXT },
        ],
        invertedIndex: {
          bm25: { k1: 1.2, b: 0.75 },
          indexTimestamps: true,
          // 영문 텍스트 위주일 때:
          // stopwords: { preset: 'en', additions: [], removals: [] },
        },
      })
    }
    return this.client.collections.get(name)
  }

  private async fieldSchema() {
    const name = FIELD_SCHEMA

    const exists = await this.client.collections.exists(name)
    if (!exists) {
      return await this.client.collections.create({
        name,
        properties: [
          {
            name: 'name',
            dataType: dataType.TEXT,
            tokenization: 'word',
            indexSearchable: true,
            indexFilterable: true,
          },
          {
            name: 'parentField',
            dataType: dataType.OBJECT,
            // object 타입은 filterable 대상이 아님 (inverted index 타입 제한)
            nestedProperties: [
              { name: 'id', dataType: dataType.UUID },
              { name: 'name', dataType: dataType.TEXT },
            ],
          },
        ],
        invertedIndex: {
          bm25: { k1: 1.2, b: 0.75 },
          indexTimestamps: true,
        },
      })
    }
    return this.client.collections.get(name)
  }

  private async departmentSchema() {
    const name = DEPARTMENT_SCHEMA

    const exists = await this.client.collections.exists(name)
    if (!exists) {
      return await this.client.collections.create({
        name,
        properties: [
          {
            name: 'name',
            dataType: dataType.TEXT,
            tokenization: 'word',
            indexSearchable: true,
            indexFilterable: true,
          },
        ],
        invertedIndex: {
          bm25: { k1: 1.2, b: 0.75 },
          indexTimestamps: true,
        },
      })
    }
    return this.client.collections.get(name)
  }

  private async professorSchema() {
    const name = PROFESSOR_SCHEMA

    const exists = await this.client.collections.exists(name)
    if (!exists) {
      return await this.client.collections.create({
        name,
        properties: [
          {
            name: 'name',
            dataType: dataType.TEXT,
            tokenization: 'word',
            indexSearchable: true,
            indexFilterable: true,
          },
          { name: 'eid', dataType: dataType.TEXT, indexFilterable: true },
          { name: 'orcid', dataType: dataType.TEXT, indexFilterable: true },
          { name: 'rid', dataType: dataType.TEXT, indexFilterable: true },
          { name: 'department', dataType: dataType.UUID, indexFilterable: true },
        ],
        invertedIndex: {
          bm25: { k1: 1.2, b: 0.75 },
          indexTimestamps: true,
        },
      })
    }
    return this.client.collections.get(name)
  }

  private async labSchema() {
    const name = LAB_SCHEMA

    const exists = await this.client.collections.exists(name)
    if (!exists) {
      return await this.client.collections.create({
        name,
        properties: [
          {
            name: 'name',
            dataType: dataType.TEXT,
            tokenization: 'word',
            indexSearchable: true,
            indexFilterable: true,
          },
          {
            name: 'professor',
            dataType: dataType.UUID,
          },
          {
            name: 'department',
            dataType: dataType.UUID,
          },
          {
            name: 'fields',
            dataType: dataType.UUID_ARRAY,
          },
          { name: 'labLink', dataType: dataType.TEXT },
        ],
      })
    }
    return this.client.collections.get(name)
  }
}
