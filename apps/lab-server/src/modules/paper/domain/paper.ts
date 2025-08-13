import { Field } from '@otl/lab-server/modules/field/domain/field'
import { Professor } from '@otl/lab-server/modules/professor/domain/professor'

export class Paper {
  id!: string

  title!: string

  description?: string

  abstract?: string

  prof!: Professor

  fields!: Field[]

  doi?: string

  coverDate?: Date

  coverDisplayDate?: Date

  publicationName?: string

  issn?: string

  sourceId?: string

  eIssn?: string

  aggregationType?: string

  volume?: string

  issueIdentifier?: string

  articleNumber?: string

  pageRange?: string

  citedByCount?: number

  publishYear?: number

  publishMonth?: number

  xmlLink?: string

  pdfLink?: string
}
