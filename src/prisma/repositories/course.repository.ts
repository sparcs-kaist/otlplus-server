import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import { subject_course, subject_lecture } from "@prisma/client";
import { courseSelectResultType } from "src/common/schemaTypes/types";

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
    return await this.prisma.subject_course.findMany({
      include: {
        department: true,
      },
      where: {
        AND: [
          department_filter,
          type_filter,
          level_filter,
          group_filter,
          keyword_filter,
          term_filter,
        ]
      }
    })
  }

  private department_filter(department: [string]) {
    if (!(department)) {
      return {}
    }
    if ("ALL" in department) {
      return {}
    } else if ("ETC" in department) {
      return {
        department: {
          code: {
            notIn: { department }
          }
        }
      }
    } else {
      return {
        department: {
          code: {
            in: { department }
          }
        }
      }
    }
  }

  private type_filter(types: [string]) {
    if (!(types)) {
      return {}
    }

    if ("ALL" in types) {
      return {}
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

  private level_filter(levels?: [string]) {
    if (!(levels)) {
      return {}
    }

    const acronym_dic = ["1", "2", "3", "4"];
    if ("ALL" in levels) {
      return {}
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

  private term_filter(term?: [string]) {
    if (!(term)) {
      return {}
    }

    if ("ALL" in term) {
      return {}
    } else {
      const current_year = new Date().getFullYear().toString();
      return {
        lecture: {
          year: current_year
        }
      }
    }
  }

  private keyword_filter(keyword?: [string]) {
    if (!(keyword)) {
      return {}
    }

    const keyword_trimed = keyword.map((word) => word.trim());
    const keyword_space_removed = keyword.map((word) => word.replace(/\s/g, ""));
    const title_filter = {
      title: {
        
      }
    }
    return
  }

  private group_filter(group?: [string]) {
    if (!(group)) {
      return {}
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