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

    const exists = await this.client.collections.exists(name.toString())
    if (!exists) {
      return await this.client.collections.create({
        name,
        properties: [
          { name: 'id', dataType: dataType.UUID },
          {
            name: 'title',
            dataType: dataType.TEXT,
            tokenization: 'word',
            indexInverted: true,
            indexSearchable: true,
          },
          {
            name: 'abstract',
            dataType: dataType.TEXT,
            tokenization: 'word',
            indexInverted: true,
            indexSearchable: true,
          },
          {
            name: 'professor',
            dataType: dataType.UUID,
          },
          {
            name: 'fields',
            dataType: dataType.UUID_ARRAY,
            indexInverted: true,
            indexSearchable: true,
            indexFilterable: true,
          },
          { name: 'doi', dataType: dataType.TEXT },
          {
            name: 'coverDate',
            dataType: dataType.DATE,
            indexRangeFilters: true,
            indexInverted: false,
            indexSearchable: true,
            indexFilterable: true,
          },
          {
            name: 'coverDisplayDate',
            dataType: dataType.TEXT,
            indexInverted: false,
            indexSearchable: true,
            indexFilterable: true,
          },
          {
            name: 'publicationName',
            dataType: dataType.TEXT,
            indexInverted: false,
            indexSearchable: true,
            indexFilterable: true,
          },
          {
            name: 'issn',
            dataType: dataType.TEXT,
            indexInverted: false,
            indexSearchable: true,
            indexFilterable: true,
          },
          {
            name: 'sourceId',
            dataType: dataType.TEXT,
            indexInverted: false,
            indexSearchable: true,
            indexFilterable: true,
          },
          {
            name: 'eIssn',
            dataType: dataType.TEXT,
            indexInverted: false,
            indexSearchable: true,
            indexFilterable: true,
          },
          {
            name: 'aggregationType',
            dataType: dataType.TEXT,
            indexInverted: false,
            indexSearchable: true,
            indexFilterable: true,
          },
          {
            name: 'volume',
            dataType: dataType.TEXT,
            indexInverted: false,
            indexSearchable: true,
            indexFilterable: true,
          },
          {
            name: 'issueIdentifier',
            dataType: dataType.TEXT,
            indexInverted: false,
            indexSearchable: true,
            indexFilterable: true,
          },
          { name: 'articleNumber', dataType: dataType.TEXT },
          { name: 'pageRange', dataType: dataType.TEXT },
          { name: 'citedByCount', dataType: dataType.INT },
          {
            name: 'publishYear',
            dataType: dataType.INT,
            indexInverted: false,
            indexSearchable: true,
            indexFilterable: true,
            indexRangeFilters: true,
          },
          {
            name: 'publishMonth',
            dataType: dataType.INT,
            indexInverted: false,
            indexSearchable: true,
            indexFilterable: true,
            indexRangeFilters: true,
          },
          {
            name: 'xmlLink',
            dataType: dataType.TEXT,
            indexInverted: false,
            indexSearchable: true,
            indexFilterable: true,
          },
          {
            name: 'pdfLink',
            dataType: dataType.TEXT,
            indexInverted: false,
            indexSearchable: true,
            indexFilterable: true,
          },
        ],
      })
    }
    return this.client.collections.get(name.toString())
  }

  private async fieldSchema() {
    const name = FIELD_SCHEMA

    const exists = await this.client.collections.exists(name.toString())
    if (!exists) {
      return await this.client.collections.create({
        name,
        properties: [
          { name: 'id', dataType: dataType.UUID },
          {
            name: 'name',
            dataType: dataType.TEXT,
            tokenization: 'word',
            indexInverted: true,
            indexSearchable: true,
            indexFilterable: true,
          },
          {
            name: 'parentField',
            dataType: dataType.OBJECT,
            nestedProperties: [
              { name: 'id', dataType: dataType.UUID },
              { name: 'name', dataType: dataType.TEXT },
            ],
          },
        ],
      })
    }
    return this.client.collections.get(name.toString())
  }

  private async departmentSchema() {
    const name = DEPARTMENT_SCHEMA

    const exists = await this.client.collections.exists(name.toString())
    if (!exists) {
      return await this.client.collections.create({
        name,
        properties: [
          { name: 'id', dataType: dataType.UUID },
          { name: 'name', dataType: dataType.TEXT },
        ],
      })
    }
    return this.client.collections.get(name.toString())
  }

  private async professorSchema() {
    const name = PROFESSOR_SCHEMA

    const exists = await this.client.collections.exists(name.toString())
    if (!exists) {
      return await this.client.collections.create({
        name,
        properties: [
          { name: 'id', dataType: dataType.UUID },
          {
            name: 'name',
            dataType: dataType.TEXT,
            tokenization: 'word',
            indexInverted: true,
            indexSearchable: true,
            indexFilterable: true,
          },
          { name: 'eid', dataType: dataType.TEXT },
          { name: 'orcid', dataType: dataType.TEXT },
          { name: 'rid', dataType: dataType.TEXT },
          {
            name: 'department',
            dataType: dataType.UUID,
          },
        ],
      })
    }
    return this.client.collections.get(name.toString())
  }

  private async labSchema() {
    const name = LAB_SCHEMA

    const exists = await this.client.collections.exists(name.toString())
    if (!exists) {
      return await this.client.collections.create({
        name,
        properties: [
          { name: 'id', dataType: dataType.UUID },
          {
            name: 'name',
            dataType: dataType.TEXT,
            tokenization: 'word',
            indexInverted: true,
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
    return this.client.collections.get(name.toString())
  }
}
