import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import { subject_classtime, subject_examtime } from "@prisma/client";

@Injectable()
export class LectureRepository{
  constructor(private readonly prisma: PrismaService){}

  async findLectureById(lectureId: string) {
    const subjectLecture = await this.prisma.subject_lecture.findUnique({
      where: { id: parseInt(lectureId) }, 
      include: {
        subject_classtime: true, 
        subject_examtime: true
      }
    });

    if (subjectLecture === null)
      return null;

    const department = await this.prisma.subject_department.findUnique({
      where: { id: subjectLecture.department_id }
    })
    
    const professorIds = await this.prisma.subject_lecture_professors.findMany({
      where: { lecture_id: subjectLecture.id }, 
      select: { professor_id: true }
    });
    const professors = professorIds === null 
                     ? []
                     : await this.prisma.subject_professor.findMany({
                      where: {
                        OR: professorIds.map(
                          ({ professor_id }) => ({ id: professor_id })
                        )
                      }, 
                      orderBy: { professor_name: "asc" }
                     });

    const [ lec, pfs, dpt ] = [ subjectLecture, professors, department ];

    return {
      id: lec.id, 

      type: lec.type, 
      type_en: lec.type_en, 
      code: lec.code, 
      old_code: lec.old_code, 
      course: lec.course_id, 
      department: dpt.id, 
      department_code: dpt.code, 
      department_name: dpt.name, 
      department_name_en: dpt.name_en, 

      title: lec.title, 
      title_en: lec.title_en, 

      year: lec.year, 
      semester: lec.semester, 

      class_no: lec.class_no, 
      limit: lec.limit, 
      num_people: lec.num_people, 
      is_english: lec.is_english, 

      num_classes: lec.num_classes, 
      num_labs: lec.num_labs, 
      credit: lec.credit, 
      credit_au: lec.credit_au, 

      grade: lec.grade, 
      load: lec.load, 
      speech: lec.speech, 
      review_total_weight: lec.review_total_weight, 

      class_title: lec.class_title, 
      class_title_en: lec.class_title_en, 
      common_title: lec.common_title, 
      common_title_en: lec.common_title_en, 

      professors: pfs.map(pf => ({
        name: pf.professor_name, 
        name_en: pf.professor_name_en, 
        professor_id: pf.professor_id, 
        review_total_weight: pf.review_total_weight
      })), 

      examtimes: lec.subject_examtime.map(LectureRepository.examtime2view), 
      classtimes: lec.subject_classtime.map(LectureRepository.classtime2view), 
    }
  }

  private static examtime2view(ext: subject_examtime, ...argv: any[]) {
    const { day, begin, end } = ext;

    return {
      day, 
      str: `${day2daynameKR(day)} ${date2hm(begin)} ~ ${date2hm(end)}`, 
      str_en: `${day2daynameEN(day)} ${date2hm(begin)} ~ ${date2hm(end)}`, 
      begin: LectureRepository.minuteCount(begin), 
      end: LectureRepository.minuteCount(end)
    }

    function day2daynameKR(day: number) {
      const daynames = [
        "월요일", 
        "화요일", 
        "수요일", 
        "목요일", 
        "금요일", 
        "토요일", 
        "일요일"
      ];

      return daynames[day];
    }

    function day2daynameEN(day: number) {
      const daynames = [
        "Monday", 
        "Tuesday", 
        "Wednesday", 
        "Thursday", 
        "Friday", 
        "Saturday", 
        "Sunday"
      ];

      return daynames[day];
    }

    function date2hm(date: Date) {
      return date.toISOString().match(/(\d+:\d+):/)[1];
    }
  }

  private static classtime2view(clt: subject_classtime, ...argv: any[]) {
    const {
      day, 
      room_name, 
      building_full_name, 
      building_full_name_en
    } = clt;
    const [ begin, end ] = [
      LectureRepository.minuteCountFloor(clt.begin), 
      LectureRepository.minuteCountCeil(clt.end)
    ];
    const buildingNameWithCodeRegex = /^\(([^)]*)\)(.*)/;

    if (!building_full_name)
      return {
        room_name: "", 
        classroom: "정보 없음", 
        classroom_en: "Unknown", 
        classroom_short: "정보 없음", 
        classroom_short_en: "Unknown", 
        building_code: "", 
        day, 
        begin, 
        end
      };

    if (buildingNameWithCodeRegex.test(building_full_name)) {
      const [
        _, 
        building_code, 
        building_name
      ] = buildingNameWithCodeRegex.exec(building_full_name);
      const building_name_en = buildingNameWithCodeRegex.test(building_full_name_en)
                             ? buildingNameWithCodeRegex.exec(building_full_name_en)[2]
                             : building_full_name_en;

      return {
        room_name: room_name ?? "", 
        classroom: `(${building_code}) ${building_name} ${room_name ?? ""}`, 
        classroom_en: `(${building_code}) ${building_name_en} ${room_name ?? ""}`, 
        classroom_short: `(${building_code}) ${room_name ?? ""}`, 
        classroom_short_en: `(${building_code}) ${room_name ?? ""}`, 
        building_code, 
        day, 
        begin, 
        end
      }
    } else {
      return {
        room_name: room_name ?? "", 
        classroom: `${building_full_name} ${room_name ?? ""}`, 
        classroom_en: `${building_full_name_en} ${room_name ?? ""}`, 
        classroom_short: `${building_full_name} ${room_name ?? ""}`, 
        classroom_short_en: `${building_full_name_en} ${room_name ?? ""}`, 
        building_code: "", 
        day, 
        begin, 
        end
      }
    }
  }

  private static minuteCount(date: Date) {
    const hours = date.getUTCHours();
    const minutes = date.getUTCMinutes();

    return hours * 60 + minutes;
  }

  private static minuteCountCeil(date: Date) {
    return Math.ceil(LectureRepository.minuteCount(date) / 30) * 30;
  }

  private static minuteCountFloor(date: Date) {
    const hours = date.getUTCHours();
    const minutes = date.getUTCMinutes();

    return Math.floor(LectureRepository.minuteCount(date) / 30) * 30;
  }
}