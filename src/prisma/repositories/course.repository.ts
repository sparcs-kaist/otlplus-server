import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma.service";

@Injectable()
export class CourseRepository{
  constructor(private readonly prisma: PrismaService){}
  
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
 //할일
 // Foreign key subject_course_professor 새로 걸어주기
 // subject_professor_course_list drop 하기
  public async filterByRequest (query: any) {
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
    const department_filter = this.department_filter(department);
    const type_filter = this.type_filter(type);
    const level_filter = this.level_filter(level);
    const group_filter = this.group_filter(group);
    const keyword_filter = this.keyword_filter(keyword);
    const term_filter = this.term_filter(term);
    let filter_list = [department_filter, type_filter, level_filter, group_filter, keyword_filter, term_filter]
    filter_list = filter_list.filter((filter) => filter !== null)
    return await this.prisma.subject_course.findMany({
      include: {
        department: true,
        professor_course_list: true
      },
      where: {
        AND: filter_list
      }
    })
  }

  private department_filter(department_names: [string]): object {
    if (!(department_names)) {
      return null
    }
    if ("ALL" in department_names) {
      return null
    } else if ("ETC" in department_names) {
      return {
        department: {
          code: {
            notIn: { department_names }
          }
        }
      }
    } else {
      return {
        department: {
          code: {
            in: { department_names }
          }
        }
      }
    }
  }

  private type_filter(types: [string]): object {
    if (!(types)) {
      return null
    }

    if ("ALL" in types) {
      return null
    } else if ("ETC" in types) {
      const unselected_types = Object.values(this.TYPE_ACRONYMS).filter((type) => !(type in types))
      return {
        type_en: {
          in: { unselected_types }
        }
      }
    } else {
      return {
        type_en: {
          in: { types }
        }
      }
    }
  }

  private level_filter(levels?: [string]): object {
    if (!(levels)) {
      return null;
    }

    const acronym_dic = ["1", "2", "3", "4"];
    if ("ALL" in levels) {
      return null;
    } else if ("ETC" in levels) {
      const numbers = acronym_dic.filter((level) => !(level in levels));
      return {
        old_code: {
          contains: {
            numbers
          }
        }
      };
    } else {
      const numbers = acronym_dic.filter((level) => level in levels);
      return {
        old_code: {
          contains: {
            numbers
          }
        }
      };
    }
  }

  private term_filter(term?: [string]): object {
    if (!(term)) {
      return null;
    }

    if ("ALL" in term) {
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

  private keyword_filter(keyword?: [string]): object {
    if (!(keyword)) {
      return null;
    }

    const keyword_trimed = keyword.map((word) => word.trim());
    const keyword_space_removed = keyword_trimed.map((word) => word.replace(/\s/g, ""));
    const title_filter = {
      title_no_space: {
        contains: { keyword_space_removed }
      }
    };
    const en_title_filter = {
      en_title_np_space: {
        contains: { keyword_space_removed }
      }
    };
    const department_name_filter = {
      department: {
        name: keyword_trimed 
      }
    };
    const department_name_en_filter = {
      department: {
        name_en: keyword_trimed 
      }
    };
    const professors_professor_name_filter = {
      subject_professor_course_list: {
        subject_professor: {
          professor_name: {
            contains: { keyword_trimed }
          }
        }
      }
    };
    const professors_professor_name_en_filter = {
      subject_professor_course_list: {
        subject_professor: {
          professor_name_en: {
            contains: { keyword_trimed }
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

  private group_filter(group?: [string]): object {
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