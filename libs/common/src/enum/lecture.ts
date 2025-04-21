export const ResearchLecture = {
  IndividualStudy: 'Individual Study',
  UnderThesisStudy: 'Thesis Study(Undergraduate)',
  ThesisResearch: 'Thesis Research(MA/phD)',
} as const
export type ResearchLecture = (typeof ResearchLecture)[keyof typeof ResearchLecture]
