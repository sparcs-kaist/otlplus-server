import { Union } from '@otl/api-interface/src/interfaces/utils/util';

export const ResearchLecture = {
  IndividualStudy: 'Individual Study',
  UnderThesisStudy: 'Thesis Study(Undergraduate)',
  ThesisResearch: 'Thesis Research(MA/phD)',
};
export type ResearchLecture = Union<typeof ResearchLecture>;
