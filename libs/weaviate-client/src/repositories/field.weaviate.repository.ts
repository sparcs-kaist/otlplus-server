import { Injectable } from '@nestjs/common'
import { Field } from '@otl/lab-server/modules/field/domain/field'
import { FieldRepository } from '@otl/lab-server/modules/field/domain/field.repository'
import { WeaviateService } from '@otl/weaviate-client'

@Injectable()
export class FieldWeaviateRepository implements FieldRepository {
  constructor(private readonly weaviate: WeaviateService) {}

  private get field() {
    return this.weaviate.client.collections.use('Field')
  }

  // weaviate generates random UUID if no id is given
  async insert(data: Field): Promise<void> {
    await this.field.data.insert({
      // id: '12345678-e64f-5d94-90db-c8cfa3fc1234',
      keyword: data.name,
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

    return result.objects.map((obj) => obj.properties as unknown as Field)
  }
}
