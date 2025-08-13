import { Injectable } from '@nestjs/common'
import { Field } from '@otl/lab-server/modules/field/domain/field'
import { FieldRepository } from '@otl/lab-server/modules/field/domain/field.repository'
import { WeaviateService } from '@otl/weaviate-client'
import { generateUuid5 } from 'weaviate-client'

@Injectable()
export class FieldWeaviateRepository implements FieldRepository {
  constructor(private readonly weaviate: WeaviateService) {}

  private get field() {
    return this.weaviate.field
  }

  // weaviate generates random UUID if no id is given
  async insert(data: Omit<Field, 'id'>): Promise<void> {
    await this.field.data.insert({
      id: generateUuid5(JSON.stringify(data)),
      properties: {
        name: data.name,
        parentField: data.parentField ? { id: data.parentField.id, name: data.parentField.name } : null,
      },
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
