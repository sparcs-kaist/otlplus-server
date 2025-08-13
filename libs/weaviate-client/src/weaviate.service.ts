import { Inject, Injectable, OnModuleInit } from '@nestjs/common'
import { FIELD_SCHEMA, LAB_SCHEMA, PAPER_SCHEMA } from '@otl/weaviate-client/types'
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

  private labCollection!: Collection<undefined, symbol, undefined> | Collection<undefined, string, undefined>

  get paper() {
    return this.paperCollection
  }

  get field() {
    return this.fieldCollection
  }

  get lab() {
    return this.labCollection
  }

  async initSchema() {
    this.paperCollection = await this.paperSchema()
    this.fieldCollection = await this.fieldSchema()
    this.labCollection = await this.labSchema()
  }

  private async paperSchema() {
    const name = PAPER_SCHEMA

    const exists = await this.client.collections.exists(name.toString())
    if (!exists) {
      return await this.client.collections.create({
        name,
        properties: [
          { name: 'id', dataType: dataType.UUID },
          { name: 'title', dataType: dataType.TEXT },
          { name: 'body', dataType: dataType.TEXT },
          {
            name: 'professor',
            dataType: dataType.OBJECT,
            nestedProperties: [
              { name: 'id', dataType: dataType.UUID },
              { name: 'name', dataType: dataType.TEXT },
              { name: 'eid', dataType: dataType.TEXT },
              { name: 'orcid', dataType: dataType.TEXT },
              { name: 'rid', dataType: dataType.TEXT },
              {
                name: 'department',
                dataType: dataType.OBJECT,
                nestedProperties: [
                  { name: 'id', dataType: dataType.UUID },
                  { name: 'name', dataType: dataType.TEXT },
                ],
              },
            ],
          },
          { name: 'fields', dataType: dataType.OBJECT_ARRAY },
          { name: 'doi', dataType: dataType.TEXT },
          { name: 'coverDate', dataType: dataType.DATE },
          { name: 'coverDisplayDate', dataType: dataType.TEXT },
          { name: 'publicationName', dataType: dataType.TEXT },
          { name: 'issn', dataType: dataType.TEXT },
          { name: 'sourceId', dataType: dataType.TEXT },
          { name: 'eIssn', dataType: dataType.TEXT },
          { name: 'aggregationType', dataType: dataType.TEXT },
          { name: 'volume', dataType: dataType.TEXT },
          { name: 'issueIdentifier', dataType: dataType.TEXT },
          { name: 'articleNumber', dataType: dataType.TEXT },
          { name: 'pageRange', dataType: dataType.TEXT },
          { name: 'citedByCount', dataType: dataType.INT },
          { name: 'publishYear', dataType: dataType.INT },
          { name: 'publishMonth', dataType: dataType.INT },
          { name: 'xmlLink', dataType: dataType.TEXT },
          { name: 'pdfLink', dataType: dataType.TEXT },
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
          { name: 'name', dataType: dataType.TEXT },
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

  private async labSchema() {
    const name = LAB_SCHEMA

    const exists = await this.client.collections.exists(name.toString())
    if (!exists) {
      return await this.client.collections.create({
        name,
        properties: [
          { name: 'id', dataType: dataType.UUID },
          { name: 'name', dataType: dataType.TEXT },
          {
            name: 'professor',
            dataType: dataType.OBJECT,
            nestedProperties: [
              { name: 'id', dataType: dataType.UUID },
              { name: 'name', dataType: dataType.TEXT },
              { name: 'eid', dataType: dataType.TEXT },
              { name: 'orcid', dataType: dataType.TEXT },
              { name: 'rid', dataType: dataType.TEXT },
              {
                name: 'department',
                dataType: dataType.OBJECT,
                nestedProperties: [
                  { name: 'id', dataType: dataType.UUID },
                  { name: 'name', dataType: dataType.TEXT },
                ],
              },
            ],
          },
          {
            name: 'department',
            dataType: dataType.OBJECT,
            nestedProperties: [
              { name: 'id', dataType: dataType.UUID },
              { name: 'name', dataType: dataType.TEXT },
            ],
          },
          {
            name: 'fields',
            dataType: dataType.OBJECT_ARRAY,
          },
          { name: 'labLink', dataType: dataType.TEXT },
        ],
      })
    }
    return this.client.collections.get(name.toString())
  }
}
