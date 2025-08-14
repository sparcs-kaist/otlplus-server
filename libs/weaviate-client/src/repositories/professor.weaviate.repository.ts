import { Injectable } from '@nestjs/common'
import { Professor } from '@otl/lab-server/modules/professor/domain/professor'
import { ProfessorRepository } from '@otl/lab-server/modules/professor/domain/professor.repository'
import { WeaviateService } from '@otl/weaviate-client'
import { Filters, generateUuid5 } from 'weaviate-client'

@Injectable()
export class ProfessorWeaviateRepository implements ProfessorRepository {
  constructor(private readonly weaviate: WeaviateService) {}

  private get professor() {
    return this.weaviate.professor
  }

  // weaviate generates random UUID if no id is given
  async insert(data: Omit<Professor, 'id'>): Promise<void> {
    await this.professor.data.insert({
      id: generateUuid5(JSON.stringify(data)),
      properties: {
        name: data.name,
        eid: data.eid,
        orcid: data.orcid,
        rid: data.rid,
        department: data.department ? { id: data.department.id } : null,
      },
    })
  }

  async deleteById(id: string): Promise<void> {
    await this.professor.data.deleteById(id)
  }

  async searchByNameAndDepartment(name: string, departmentUUID: string): Promise<Professor[]> {
    const filters = Filters.and(
      this.professor.filter.byProperty('Professor').like(`${name}*`),
      this.professor.filter.byProperty('Department').equal(departmentUUID),
    )
    const result = await this.professor.query.fetchObjects({
      filters,
      limit: 10,
    })

    return result.objects.map((obj) => obj.properties as unknown as Professor)
  }

  async searchByEidOrOrcidOrRid(id: string): Promise<Professor[]> {
    const result = await this.professor.query.fetchObjects({
      filters: this.professor.filter.byProperty('Professor').like(`${id}*`),
      limit: 10,
    })

    return result.objects.map((obj) => obj.properties as unknown as Professor)
  }
}
