import { Injectable } from '@nestjs/common'
import { Lab } from '@otl/lab-server/modules/lab/domain/lab'
import { LabRepository } from '@otl/lab-server/modules/lab/domain/lab.repository'
import { WeaviateService } from '@otl/weaviate-client'

@Injectable()
export class LabWeaviateRepository implements LabRepository {
  constructor(private readonly weaviate: WeaviateService) {}

  private get lab() {
    return this.weaviate.client.collections.use('Lab')
  }

  // weaviate generates random UUID if no id is given
  async insert(data: Lab): Promise<void> {
    await this.lab.data.insert({
      // id: '12345678-e64f-5d94-90db-c8cfa3fc1234',
      properties: {
        name: data.name,
        prof: data.professorName,
        department: data.department,
        keywords: data.fields ?? [],
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
      filters: this.lab.filter.byProperty('prof').equal(name),
      limit: 10,
    })

    return result.objects.map((obj) => obj.properties)
  }
}
