import { Injectable } from '@nestjs/common'

@Injectable()
export class WeaviateService {
  private readonly endpoint = 'http://localhost:8080/v1/graphql'

  // async autocomplete(prefix: string): Promise<string[]> {}
}
