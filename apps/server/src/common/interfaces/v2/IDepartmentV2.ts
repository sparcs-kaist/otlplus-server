export namespace IDepartmentV2 {
  export interface Basic {
    id: number
    name: string
  }
  export interface Response {
    undergraduate: Basic[]
    recent: Basic[]
    other: Basic[]
  }
}
