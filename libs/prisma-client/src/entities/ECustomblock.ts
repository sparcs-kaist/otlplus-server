export namespace ECustomblock {
  // Minimal shape mirroring block_custom_blocks (aligns with ICustomblock.Basic)
  export interface Basic {
    id: number
    block_name: string
    place: string
    day: number
    begin: number // 00시부터 경과 분 (예: 780 = 13:00)
    end: number // 00시부터 경과 분 (예: 810 = 13:30)
  }

  // Helper input shapes for service/repo methods (pair with ICustomblock DTOs)
  export type CreateInput = Pick<Basic, 'block_name' | 'place' | 'day' | 'begin' | 'end'>
  export type UpdateInput = Partial<Pick<Basic, 'block_name' | 'place'>>
}
