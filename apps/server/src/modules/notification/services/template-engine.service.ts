import { Injectable } from '@nestjs/common'

import logger from '@otl/common/logger/logger'

@Injectable()
export class TemplateEngineService {
  render(template: string, variables: Record<string, string>): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      if (key in variables) {
        return variables[key]
      }
      logger.warn(`[TemplateEngine] Unresolved variable: ${match}`)
      return ''
    })
  }
}
