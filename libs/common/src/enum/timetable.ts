export const TimetableItemKind = {
  LECTURE: 'lecture',
  CUSTOM: 'custom',
} as const

export type TimetableItemKind = (typeof TimetableItemKind)[keyof typeof TimetableItemKind]
