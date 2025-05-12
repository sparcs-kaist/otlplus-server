type ValueType = string | number | boolean;
export type Union<
  T extends
    | {
        [key: string]: ValueType;
      }
    | ReadonlyArray<ValueType>,
> =
  T extends ReadonlyArray<ValueType>
    ? T[number]
    : T extends {
          [key: string]: infer U;
        }
      ? U
      : never;
export declare function generationUnionTypeChecker<UnionType extends string>(
  ...values: UnionType[]
): (value: unknown) => UnionType | Error;
export {};
