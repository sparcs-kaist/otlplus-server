export namespace IProfessor {
  export interface Basic {
    name: string
    name_en: string | null
    professor_id: number
    review_total_weight: number
  }
  export interface Simple {
    id: number
    name: string
  }
}
