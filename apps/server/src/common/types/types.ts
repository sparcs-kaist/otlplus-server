export namespace FilterType {
  export type SubjectClasstimeFilter = {
    day?: { equals: number }
    begin?: { gte: Date | undefined }
    end?: { lte: Date | undefined }
  }
}
