export namespace ECustomblock {
  export interface Time {
    day: number
    begin: number
    end: number
  }

  export interface Basic extends Time {
    id: number
    block_name: string
    place: string
    times: Time[]
  }

  export type CreateInput = Pick<Basic, 'block_name' | 'place'> & Partial<Time> & { times?: Time[] }
  export type UpdateInput = Partial<CreateInput>

  // Older server instances only write parent fields during a rolling deployment.
  export const getTimes = (block: Time & { times?: Time[] }): Time[] => (
    [block, ...(block.times?.slice(1) ?? [])]
  ).map(({ day, begin, end }) => ({ day, begin, end }))

  export const normalize = (block: Omit<Basic, 'times'> & { times?: Time[] }): Basic => {
    const times = getTimes(block)
    return {
      id: block.id, block_name: block.block_name, place: block.place, ...times[0], times,
    }
  }

  // Legacy flat updates affect only the first occurrence; metadata edits keep every occurrence.
  export const applyUpdate = (block: Basic, update: UpdateInput): Basic => {
    const times = update.times ?? getTimes(block).map((time, index) => (index === 0
      ? {
        day: update.day ?? time.day,
        begin: update.begin ?? time.begin,
        end: update.end ?? time.end,
      }
      : time))
    return {
      ...block, ...update, ...times[0], times,
    }
  }

  export const overlaps = (left: Time, right: Time) => left.day === right.day && left.begin < right.end && right.begin < left.end
}
