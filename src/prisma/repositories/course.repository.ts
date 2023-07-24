import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import { applyOrder, applyOffset } from "src/common/utils/search.utils";
import { subject_course } from "../generated/prisma-class/subject_course";

@Injectable()
export class CourseRepository {
  constructor(
    private readonly prisma: PrismaService
  ){}
  
  private TYPE_ACRONYMS = {
    "GR": "General Required",
    "MGC": "Mandatory General Courses",
    "BE": "Basic Elective",
    "BR": "Basic Required",
    "EG": "Elective(Graduate)",
    "HSE": "Humanities & Social Elective",
    "OE": "Other Elective",
    "ME": "Major Elective",
    "MR": "Major Required",
  }
  private MAJOR_ACRONYMS = [
      "CE",
      "MSB",
      "ME",
      "PH",
      "BiS",
      "IE",
      "ID",
      "BS",
      "CBE",
      "MAS",
      "MS",
      "NQE",
      "HSS",
      "EE",
      "CS",
      "AE",
      "CH",
      "TS",
  ]

  public async getCourseById (id: number): Promise<subject_course> {
    return await this.prisma.subject_course.findUnique({
      include: {
        subject_department: true,
        subject_course_professors: { include: { professor: true } },
        lecture: true,
        subject_courseuser: true,
      },
      where: {
        id: id
      }
    }) as subject_course;
  }

  public async filterByRequest (query: any): Promise<subject_course[]> {
    const DEFAULT_LIMIT = 150;
    const DEFAULT_ORDER = ['old_code']

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
    const levelFilter = this.levelFilter(level);
    const groupFilter = this.groupFilter(group);
    const keywordFilter = this.keywordFilter(keyword);
    const term_filter = this.termFilter(term);
    let filterList = [departmentFilter, typeFilter, levelFilter, groupFilter, keywordFilter, term_filter]
    filterList = filterList.filter((filter) => filter !== null)
    const query_result = await this.prisma.subject_course.findMany({
      include: {
        subject_department: true,
        subject_course_professors: { include: { professor: true } },
        lecture: true,
        subject_courseuser: true,
      },
      where: {
        AND: filterList
      },
      take: limit ?? DEFAULT_LIMIT,
    }) as subject_course[];

    // Apply Ordering and Offset
    const ordered_result = await applyOrder<subject_course>(query_result, order ?? DEFAULT_ORDER);
    return await applyOffset<subject_course>(ordered_result, offset ?? 0);
  }

  private departmentFilter(department_names: [string]): object {
    if (!(department_names)) {
      return null
    }
    if (department_names.includes("ALL")) {
      return null
    } else if (department_names.includes("ETC")) {
      return {
        subject_department: {
          code: {
            notIn: this.MAJOR_ACRONYMS.filter((x) => department_names.includes(x))
          }
        }
      }
    } else {
      return {
        subject_department: {
          code: {
            in: this.MAJOR_ACRONYMS.filter((x) => department_names.includes(x))
          }
        }
      }
    }
  }

  private typeFilter(types: [string]): object {
    if (!(types)) {
      return null
    }

    if (types.includes("ALL")) {
      return null
    } else if (types.includes("ETC")) {
      const unselected_types = Object.values(this.TYPE_ACRONYMS).filter((type) => !(type in types))
      return {
        type_en: {
          in: unselected_types
        }
      }
    } else {
      return {
        type_en: {
          in: types
        }
      }
    }
  }

  private levelFilter(levels?: [string]): object {
    if (!(levels)) {
      return null;
    }

    const acronym_dic = ["1", "2", "3", "4"];
    if (levels.includes("ALL")) {
      return null;
    } else if (levels.includes("ETC")) {
      const numbers = acronym_dic.filter((level) => !(level in levels));
      return {
        old_code: {
          contains: numbers
        }
      };
    } else {
      const numbers = acronym_dic.filter((level) => level in levels);
      return {
        old_code: {
          contains: numbers
        }
      };
    }
  }

  private termFilter(term?: [string]): object {
    if (!(term)) {
      return null;
    }

    if (term.includes("ALL")) {
      return null;
    } else {
      const current_year = new Date().getFullYear().toString();
      return {
        lecture: {
          year: current_year
        }
      };
    }
  }

  private keywordFilter(keyword?: string): object {
    if (!(keyword)) {
      return null;
    }

    const keyword_trimed = keyword.trim()
    const keyword_space_removed = keyword_trimed.replace(/\s/g, "");
    const title_filter = {
      title_no_space: {
        contains: keyword_space_removed
      }
    };
    const en_title_filter = {
      title_en_no_space: {
        contains: keyword_space_removed
      }
    };
    const department_name_filter = {
      subject_department: {
        name: keyword_trimed 
      }
    };
    const department_name_en_filter = {
      subject_department: {
        name_en: keyword_trimed 
      }
    };
    const professors_professor_name_filter = {
      subject_course_professors: {
        some: {
          professor: {
            professor_name: {
              contains: keyword_trimed
            }
          }
        }
      }
    };
    const professors_professor_name_en_filter = {
      subject_course_professors: {
        some: {
          professor: {
            professor_name_en: {
              contains: keyword_trimed
            }
          }
        }
      }
    }
    return {
      OR: [
        title_filter,
        en_title_filter,
        department_name_filter,
        department_name_en_filter,
        professors_professor_name_filter,
        professors_professor_name_en_filter
      ]
    };
  }

  private groupFilter(group?: [string]): object {
    if (!(group)) {
      return null;
    }

    const filter = [];

    if ("Basic" in group) {
      filter.push("Basic Required", "Basic Elective");
    }
    if ("Humanity" in group) {
      filter.push("Humanities & Social Elective");
    }
    if (group.length > 2) {
      filter.push("Major Required", "Major Elective", "Elective(Graduate)");
    }

    return {
      type_en: {
        in: { filter }
      }
    };
  }
}