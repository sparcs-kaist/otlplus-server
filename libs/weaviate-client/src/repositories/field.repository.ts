import { Injectable } from '@nestjs/common'
import { FieldData, FieldRepositoryInterface } from '@otl/lab-server/repositories/field.repository'
import { WeaviateService } from '@otl/weaviate-client'

@Injectable()
export class FieldRepository implements FieldRepositoryInterface {
  constructor(private readonly weaviate: WeaviateService) {}

  private get field() {
    return this.weaviate.client.collections.use('Field')
  }

  // weaviate generates random UUID if no id is given
  async insert(data: FieldData): Promise<void> {
    await this.field.data.insert({
      // id: '12345678-e64f-5d94-90db-c8cfa3fc1234',
      keyword: data.keyword,
      parentField: data.parentField ?? null,
    })
  }

  async deleteById(id: string): Promise<void> {
    await this.field.data.deleteById(id)
  }

  async searchByPrefix(prefix: string): Promise<any[]> {
    const result = await this.field.query.fetchObjects({
      filters: this.field.filter.byProperty('Field').like(`${prefix}*`),
      limit: 10,
    })

    return result.objects.map((obj) => obj.properties as unknown as FieldData)
  }
}
