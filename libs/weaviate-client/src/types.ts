export const PAPER_SCHEMA = Symbol('PAPER')
export const LAB_SCHEMA = Symbol('LAB')
export const FIELD_SCHEMA = Symbol('FIELD')
export const DEPARTMENT_SCHEMA = Symbol('DEPARTMENT')
export const PROFESSOR_SCHEMA = Symbol('PROFESSOR')
export type SchemaType =
  | typeof PAPER_SCHEMA
  | typeof LAB_SCHEMA
  | typeof FIELD_SCHEMA
  | typeof DEPARTMENT_SCHEMA
  | typeof PROFESSOR_SCHEMA
