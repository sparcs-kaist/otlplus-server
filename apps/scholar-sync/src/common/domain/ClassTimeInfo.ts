import { ELecture } from '@otl/prisma-client/entities';
import { IScholar } from '@otl/scholar-sync/clients/scholar/IScholar';

export class ClassTimeInfo {
  day!: number;
  begin!: Date;
  end!: Date;
  type!: 'l' | 'e';
  building_id!: string;
  room_name!: string;
  building_full_name!: string;
  building_full_name_en!: string;
  unit_time!: number | null;

  public static deriveClasstimeInfo(classTime: IScholar.ScholarClasstimeType): ClassTimeInfo {
    return {
      day: classTime.LECTURE_DAY,
      begin: new Date('1970-01-01T' + classTime.LECTURE_BEGIN.slice(11) + 'Z'),
      end: new Date('1970-01-01T' + classTime.LECTURE_END.slice(11) + 'Z'),
      type: classTime.LECTURE_TYPE,
      building_id: classTime.BUILDING.toString(),
      room_name: classTime.ROOM_NO,
      building_full_name: `(${classTime.BUILDING})${classTime.ROOM_K_NAME}`,
      building_full_name_en: `(${classTime.BUILDING})${classTime.ROOM_E_NAME}`,
      unit_time: classTime.TEACHING,
    };
  }

  public static equals(classtime: ClassTimeInfo, existing: ELecture.Details['subject_classtime'][number]) {
    return (
      classtime.day === existing.day &&
      classtime.begin.getHours() === existing.begin.getHours() &&
      classtime.begin.getMinutes() === existing.begin.getMinutes() &&
      classtime.type === existing.type &&
      classtime.building_id === existing.building_id &&
      classtime.room_name === existing.room_name &&
      classtime.building_full_name === existing.building_full_name &&
      classtime.building_full_name_en === existing.building_full_name_en &&
      classtime.unit_time === existing.unit_time
    );
  }
}
