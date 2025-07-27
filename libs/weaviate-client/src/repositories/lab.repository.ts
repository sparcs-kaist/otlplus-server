import { Injectable } from '@nestjs/common'
import { LabData, LabRepositoryInterface } from '@otl/lab-server/repositories/lab.repository'
import { WeaviateService } from '@otl/weaviate-client'

@Injectable()
export class LabRepository implements LabRepositoryInterface {
  constructor(private readonly weaviate: WeaviateService) {}

  private get lab() {
    return this.weaviate.client.collections.use('Lab')
  }

  // weaviate generates random UUID if no id is given
  async insert(data: LabData): Promise<void> {
    await this.lab.data.insert({
      // id: '12345678-e64f-5d94-90db-c8cfa3fc1234',
      properties: {
        name: data.name,
        prof: data.prof,
        department: data.department,
        location: data.location ?? null,
        keywords: data.keywords ?? [],
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
