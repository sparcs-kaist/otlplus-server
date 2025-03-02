import { Union } from '../../utils/method.utils';

export const ResearchLecture = {
  IndividualStudy: 'Individual Study',
  UnderThesisStudy: 'Thesis Study(Undergraduate)',
  ThesisResearch: 'Thesis Research(MA/phD)',
};
export type ResearchLecture = Union<typeof ResearchLecture>;
