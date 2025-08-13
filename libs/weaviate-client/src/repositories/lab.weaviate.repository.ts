import { Injectable } from '@nestjs/common'
import { Lab } from '@otl/lab-server/modules/lab/domain/lab'
import { LabRepository } from '@otl/lab-server/modules/lab/domain/lab.repository'
import { WeaviateService } from '@otl/weaviate-client'
import { generateUuid5 } from 'weaviate-client'

@Injectable()
export class LabWeaviateRepository implements LabRepository {
  constructor(private readonly weaviate: WeaviateService) {}

  private get lab() {
    return this.weaviate.lab
  }

  // weaviate generates random UUID if no id is given
  async insert(data: Omit<Lab, 'id'>): Promise<void> {
    await this.lab.data.insert({
      id: generateUuid5(JSON.stringify(data)),
      properties: {
        name: data.name ? data.name : null,
        professor: data.professor.id,
        department: data.department.id,
        fields: data.fields.map((field) => field.id),
        labLink: data.labLink,
      },
    })
  }

  async findById(id: string): Promise<any | null> {
    const result = await this.lab.query.fetchObjectById(id)
    return result?.properties ?? null
  }

  async deleteById(id: string): Promise<void> {
    await this.lab.data.deleteById(id)
  }

  async findByProfName(name: string): Promise<any[]> {
    const result = await this.lab.query.fetchObjects({
      filters: this.lab.filter.byProperty('professor').equal(name),
      limit: 10,
    })

    return result.objects.map((obj) => obj.properties)
  }
}
