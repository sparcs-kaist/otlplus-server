type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };
export type XOR<T, U> = (T & Without<U, T>) | (U & Without<T, U>);
// XOR 구현한 타입, XOR<A,B> 이면 A, B둘중 하나의 타입만을 갖는다는 뜻.

export namespace FilterType {
  export type SubjectClasstimeFilter = {
    day?: { equals: number };
    begin?: { gte: Date | undefined };
    end?: { lte: Date | undefined };
  };
}
