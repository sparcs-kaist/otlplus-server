export namespace ISchedules {
  export interface Basic {
    year: number
    from: Date
    to: Date
    name: string
  }

  export interface SchedulesResponse {
    schedules: Basic[]
  }
}
