import { Injectable } from '@nestjs/common'
import { WeaviateService } from '@otl/weaviate-client/weaviate.service'

@Injectable()
export class LabService {
  constructor(private weaviate: WeaviateService) {}

  // TODO: implement autocomplete/hybrid search logic below
  autocomplete(prefix: string) {
    return prefix
  }
}
