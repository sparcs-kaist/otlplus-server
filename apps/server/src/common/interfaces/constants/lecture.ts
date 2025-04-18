import { Union } from '@otl/common/utils/type'

export const ResearchLecture = {
  IndividualStudy: 'Individual Study',
  UnderThesisStudy: 'Thesis Study(Undergraduate)',
  ThesisResearch: 'Thesis Research(MA/phD)',
}
export type ResearchLecture = Union<typeof ResearchLecture>
