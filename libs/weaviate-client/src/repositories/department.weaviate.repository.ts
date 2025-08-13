import { Injectable } from '@nestjs/common'
import { Department } from '@otl/lab-server/modules/department/domain/department'
import { DepartmentRepository } from '@otl/lab-server/modules/department/domain/department.repository'
import { WeaviateService } from '@otl/weaviate-client'
import { generateUuid5 } from 'weaviate-client'

@Injectable()
export class DepartmentWeaviateRepository implements DepartmentRepository {
  constructor(private readonly weaviate: WeaviateService) {}

  private get department() {
    return this.weaviate.department
  }

  // weaviate generates random UUID if no id is given
  async insert(data: Omit<Department, 'id'>): Promise<void> {
    await this.department.data.insert({
      id: generateUuid5(JSON.stringify(data)),
      properties: {
        name: data.name,
      },
    })
  }

  async deleteById(id: string): Promise<void> {
    await this.department.data.deleteById(id)
  }

  async searchByName(name: string): Promise<Department[]> {
    const result = await this.department.query.fetchObjects({
      filters: this.department.filter.byProperty('Department').like(`${name}*`),
      limit: 10,
    })

    // need to check
    // need to map to department
    return result.objects.map((obj) => obj.properties as unknown as Department)
  }
}
