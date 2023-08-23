import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import { applyOrder, applyOffset } from "src/common/utils/search.utils";
import { CourseDetails, LectureDetails } from "../../common/schemaTypes/types";
import { session_userprofile } from "@prisma/client";

@Injectable()
export class CourseRepository {
  constructor(private readonly prisma: PrismaService) {}

  private TYPE_ACRONYMS = {
    GR: 'General Required',
    MGC: 'Mandatory General Courses',
    BE: 'Basic Elective',
    BR: 'Basic Required',
    EG: 'Elective(Graduate)',
    HSE: 'Humanities & Social Elective',
    OE: 'Other Elective',
    ME: 'Major Elective',
    MR: 'Major Required',
  };
  private MAJOR_ACRONYMS = [
    'CE',
    'MSB',
    'ME',
    'PH',
    'BiS',
    'IE',
    'ID',
    'BS',
    'CBE',
    'MAS',
    'MS',
    'NQE',
    'HSS',
    'EE',
    'CS',
    'AE',
    'CH',
    'TS',
  ];

  public async getCourseById(id: number): Promise<CourseDetails> {
    return await this.prisma.subject_course.findUnique({
      include: {
        subject_department: true,
        subject_course_professors: { include: { professor: true } },
        lecture: true,
        subject_courseuser: true,
      },
      where: {
        id: id,
      },
    });
  }

  public async getLecturesByCourseId(
    query: { order: string[] },
    id: number,
  ): Promise<LectureDetails[]> {
    const course = await this.prisma.subject_course.findUnique({
      include: {
        lecture: {
          include: {
            subject_department: true,
            subject_lecture_professors: { include: { professor: true } },
            subject_classtime: true,
            subject_examtime: true,
          },
        },
      },
      where: {
        id: id,
      },
    });
    const filteredLecture = course.lecture.filter(
      (lecture) => !lecture.deleted,
    );
    const order = query.order ? query.order : ['year', 'semester', 'class_no'];
    return applyOrder<LectureDetails>(filteredLecture, order);
  }

  //@todo: optimize goal: 1.5s -> 0.5s, recommended: using cache
  public async filterByRequest(query: any): Promise<CourseDetails[]> {
    const DEFAULT_LIMIT = 150;
    const DEFAULT_ORDER = ['old_code'];

    const {
      department,
      type,
      level,
      group,
      keyword,
      term,
      order,
      offset,
      limit,
    } = query;
    const departmentFilter = this.departmentFilter(department);
    const typeFilter = this.typeFilter(type);
    const groupFilter = this.groupFilter(group);
    const keywordFilter = this.keywordFilter(keyword);
    const term_filter = this.termFilter(term);
    let filterList = [
      departmentFilter,
      typeFilter,
      groupFilter,
      keywordFilter,
      term_filter,
    ];
    filterList = filterList.filter((filter) => filter !== null);
    const queryResult = await this.prisma.subject_course.findMany({
      include: {
        subject_department: true,
        subject_course_professors: { include: { professor: true } },
        lecture: true,
        subject_courseuser: true,
      },
      where: {
        AND: filterList,
      },
      take: limit ?? DEFAULT_LIMIT,
    });
    const levelFilteredResult = this.levelFilter<CourseDetails>(
      queryResult,
      level,
    );

    // Apply Ordering and Offset
    const orderedResult = applyOrder<CourseDetails>(
      levelFilteredResult,
      order ?? DEFAULT_ORDER,
    );
    return applyOffset<CourseDetails>(orderedResult, offset ?? 0);
  }

  public departmentFilter(department_names: string[]): object {
    if (!department_names) {
      return null;
    }
    if (department_names.includes('ALL')) {
      return null;
    } else if (department_names.includes('ETC')) {
      return {
        subject_department: {
          code: {
            notIn: this.MAJOR_ACRONYMS.filter((x) =>
              department_names.includes(x),
            ),
          },
        },
      };
    } else {
      return {
        subject_department: {
          code: {
            in: this.MAJOR_ACRONYMS.filter((x) => department_names.includes(x)),
          },
        },
      };
    }
  }

  public typeFilter(types: string[]): object {
    if (!types) {
      return null;
    }

    if (types.includes('ALL')) {
      return null;
    } else if (types.includes('ETC')) {
      const unselected_types = Object.keys(this.TYPE_ACRONYMS)
        .filter((type) => !(type in types))
        .map((type) => this.TYPE_ACRONYMS[type]);
      return {
        type_en: {
          in: unselected_types,
        },
      };
    } else {
      return {
        type_en: {
          in: types.map((type) => this.TYPE_ACRONYMS[type]),
        },
      };
    }
  }

  public termFilter(term?: string[]): object {
    if (!term) {
      return null;
    }

    if (term.includes('ALL')) {
      return null;
    } else {
      const current_year = new Date().getFullYear().toString();
      return {
        lecture: {
          year: current_year,
        },
      };
    }
  }

  public keywordFilter(keyword?: string, isCourse = true): object {
    if (!keyword) {
      return null;
    }

    const keyword_trimed = keyword.trim();
    const keyword_space_removed = keyword_trimed.replace(/\s/g, '');
    const title_filter = {
      title_no_space: {
        contains: keyword_space_removed,
      },
    };
    const en_title_filter = {
      title_en_no_space: {
        contains: keyword_space_removed,
      },
    };
    const department_name_filter = {
      subject_department: {
        name: keyword_trimed,
      },
    };
    const department_name_en_filter = {
      subject_department: {
        name_en: keyword_trimed,
      },
    };
    const professors_professor_name_filter = isCourse
      ? {
          subject_course_professors: {
            some: {
              professor: {
                professor_name: {
                  contains: keyword_trimed,
                },
              },
            },
          },
        }
      : {
          subject_lecture_professors: {
            some: {
              professor: {
                professor_name: {
                  contains: keyword_trimed,
                },
              },
            },
          },
        };
    const professors_professor_name_en_filter = isCourse
      ? {
          subject_course_professors: {
            some: {
              professor: {
                professor_name_en: {
                  contains: keyword_trimed,
                },
              },
            },
          },
        }
      : {
          subject_lecture_professors: {
            some: {
              professor: {
                professor_name_en: {
                  contains: keyword_trimed,
                },
              },
            },
          },
        };
    return {
      OR: [
        title_filter,
        en_title_filter,
        department_name_filter,
        department_name_en_filter,
        professors_professor_name_filter,
        professors_professor_name_en_filter,
      ],
    };
  }

  public groupFilter(group?: string[]): object {
    if (!group) {
      return null;
    }

    const filter = [];

    if ('Basic' in group) {
      filter.push('Basic Required', 'Basic Elective');
    }
    if ('Humanity' in group) {
      filter.push('Humanities & Social Elective');
    }
    if (group.length > 2) {
      filter.push('Major Required', 'Major Elective', 'Elective(Graduate)');
    }

    return {
      type_en: {
        in: { filter },
      },
    };
  }

  public levelFilter<T extends CourseDetails | LectureDetails>(
    queryResult: T[],
    levels: string[],
  ): T[] {
    if (!levels) {
      return queryResult;
    }

    const levelFilters = levels.map((level) => level[0]);
    if (levels.includes('ALL')) {
      return queryResult;
    } else if (levels.includes('ETC')) {
      return queryResult.filter((item) => {
        const level = item.old_code.replace(/[^0-9]/g, '')[0];
        return !levelFilters.includes(level);
      });
    } else {
      return queryResult.filter((item) => {
        const level = item.old_code.replace(/[^0-9]/g, '')[0];
        return levelFilters.includes(level);
      });
    }
  }

  async getUserTakenCourses(
    takenLecturesId: number[],
    order: string[],
  ): Promise<CourseDetails[]> {
    const orderFilter: { [key: string]: string }[] = [];
    order.forEach((orderList) => {
      const orderDict: { [key: string]: string } = {};
      let order = 'asc';
      const orderBy = orderList.split('-');
      if (orderBy[0] == '') {
        order = 'desc';
      }
      orderDict[orderBy[orderBy.length - 1]] = order;
      orderFilter.push(orderDict);
    });
    return await this.prisma.subject_course.findMany({
      where: {
        lecture: {
          some: {
            id: {
              in: takenLecturesId,
            },
          },
        },
      },
      orderBy: orderFilter,
      include: {
        subject_department: true,
        subject_course_professors: { include: { professor: true } },
        lecture: true,
        subject_courseuser: true,
      },
    });
  }
}