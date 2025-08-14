import { Injectable } from '@nestjs/common'
import { Paper } from '@otl/lab-server/modules/paper/domain/paper'
import { PaperRepository } from '@otl/lab-server/modules/paper/domain/paper.repository'
import { WeaviateService } from '@otl/weaviate-client'
import { generateUuid5 } from 'weaviate-client'

@Injectable()
export class PaperWeaviateRepository implements PaperRepository {
  constructor(private readonly weaviate: WeaviateService) {}

  private get paper() {
    return this.weaviate.paper
  }

  // weaviate generates random UUID if no id is given
  async insert(data: Paper): Promise<void> {
    await this.paper.data.insert({
      id: generateUuid5(
        JSON.stringify({
          title: data.title,
          abstract: data.abstract,
          professor: data.professor.id,
        }),
      ),
      properties: {
        title: data.title,
        professor: data.professor.id,
        fields: data.fields.map((field) => field.id),
        doi: data.doi ?? null,
        coverDate: data.coverDate ?? null,
        coverDisplayDate: data.coverDisplayDate ?? null,
        publicationName: data.publicationName ?? null,
        issn: data.issn ?? null,
        sourceId: data.sourceId ?? null,
        eIssn: data.eIssn ?? null,
        aggregationType: data.aggregationType ?? null,
        volume: data.volume ?? null,
        issueIdentifier: data.issueIdentifier ?? null,
        articleNumber: data.articleNumber ?? null,
        pageRange: data.pageRange ?? null,
        citedByCount: data.citedByCount ?? null,
        publishYear: data.publishYear ?? null,
        publishMonth: data.publishMonth ?? null,
        xmlLink: data.xmlLink ?? null,
        pdfLink: data.pdfLink ?? null,
      },
    })
  }

  async searchByTitle(title: string): Promise<any[]> {
    const result = await this.weaviate.paper.query.hybrid(title, {
      limit: 10,
    })

    return result.objects.map((obj) => obj.properties as unknown as Paper)
  }

  async findByProfName(name: string): Promise<any[]> {
    const result = await this.weaviate.paper.query.bm25(name, {
      limit: 10,
    })

    return result.objects.map((obj) => obj.properties as unknown as Paper)
  }
}
