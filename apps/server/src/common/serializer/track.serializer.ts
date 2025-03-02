import { ETrack } from '@otl/api-interface/src/entities/ETrack';
import { IPlanner } from '@otl/api-interface/src/interfaces/IPlanner';
import { toJsonDepartment } from './department.serializer';
import { AddtionalTrackTypeNarrower } from '@otl/api-interface/src/interfaces/constants/additional.track.response.dto';

export const toJsonGeneralTrack = (generalTrack: ETrack.General): IPlanner.ITrack.General => {
  return {
    id: generalTrack.id,
    start_year: generalTrack.start_year,
    end_year: generalTrack.end_year,
    is_foreign: generalTrack.is_foreign,
    total_credit: generalTrack.total_credit,
    total_au: generalTrack.total_au,
    basic_required: generalTrack.basic_required,
    basic_elective: generalTrack.basic_elective,
    thesis_study: generalTrack.thesis_study,
    thesis_study_doublemajor: generalTrack.thesis_study_doublemajor,
    general_required_credit: generalTrack.general_required_credit,
    general_required_au: generalTrack.general_required_au,
    humanities: generalTrack.humanities,
    humanities_doublemajor: generalTrack.humanities_doublemajor,
  };
};

export const toJsonMajorTrack = (majorTrack: ETrack.Major): IPlanner.ITrack.Major => {
  return {
    id: majorTrack.id,
    start_year: majorTrack.start_year,
    end_year: majorTrack.end_year,
    department: toJsonDepartment(majorTrack.subject_department),
    basic_elective_doublemajor: majorTrack.basic_elective_doublemajor,
    major_required: majorTrack.major_required,
    major_elective: majorTrack.major_elective,
  };
};

export const toJsonAdditionalTrack = (additionalTrack: ETrack.Additional): IPlanner.ITrack.Additional => {
  const type = AddtionalTrackTypeNarrower(additionalTrack.type);

  if (type instanceof Error) {
    throw type;
  }

  return {
    id: additionalTrack.id,
    start_year: additionalTrack.start_year,
    end_year: additionalTrack.end_year,
    type,
    department:
      additionalTrack.subject_department === null ? null : toJsonDepartment(additionalTrack.subject_department),
    major_required: additionalTrack.major_required,
    major_elective: additionalTrack.major_elective,
  };
};
