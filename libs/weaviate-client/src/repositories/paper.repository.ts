import { Injectable } from '@nestjs/common'
import { PaperData, PaperRepositoryInterface } from '@otl/lab-server/repositories/paper.repository'
import { WeaviateService } from '@otl/weaviate-client'

@Injectable()
export class PaperRepository implements PaperRepositoryInterface {
  constructor(private readonly weaviate: WeaviateService) {}

  private get paper() {
    return this.weaviate.client.collections.use('Paper')
  }

  // weaviate generates random UUID if no id is given
  async insert(data: PaperData): Promise<void> {
    await this.paper.data.insert({
      // id: '12345678-e64f-5d94-90db-c8cfa3fc1234',
      properties: {
        title: data.title,
        prof: data.prof,
        keywords: data.keywords,
      },
    })
  }

  async searchByTitle(title: string): Promise<any[]> {
    const result = await this.paper.query.hybrid(title, {
      limit: 10,
    })

    return result.objects.map((obj) => obj.properties as PaperData)
  }

  async findByProfName(name: string): Promise<any[]> {
    const result = await this.paper.query.bm25(name, {
      limit: 10,
    })

    return result.objects.map((obj) => obj.properties as PaperData)
  }
}
