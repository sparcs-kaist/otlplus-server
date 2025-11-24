export namespace IDepartmentV2 {
  export interface Basic {
    id: number
    name: string
  }

  export interface Detail {
    id: number
    name: string
    code: string
  }

  export interface Response {
    departments: Detail[]
  }
}
