export namespace IProfessor {
  export interface Basic {
    name: string
    name_en: string
    professor_id: number
    review_total_weight: number
  }

  export interface v2Basic {
    professorName: string
    professerId: number
  }
}
