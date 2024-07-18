import { Prisma, subject_lecture } from '@prisma/client';
import { IPrismaMiddleware } from 'src/common/interfaces/IPrismaMiddleware';
import { XOR } from 'src/common/schemaTypes/types';
import { PrismaService } from '../prisma.service';

export class LectureMiddleware implements IPrismaMiddleware.IPrismaMiddleware {
  private static instance: LectureMiddleware;
  private prisma: PrismaService;

  constructor(prisma: PrismaService) {
    this.prisma = prisma;
  }

  async preExecute(): Promise<boolean> {
    return true;
  }

  async postExecute(
    operations: IPrismaMiddleware.operationType,
    args: any,
    result: any,
  ): Promise<boolean> {
    if (
      operations === 'create' ||
      operations === 'update' ||
      operations === 'upsert'
    ) {
      const t: XOR<
        Prisma.subject_lectureUpdateInput,
        Prisma.subject_lectureUncheckedUpdateInput
      > = args?.data;
      if (
        !t.common_title &&
        !t.class_title &&
        !t.common_title_en &&
        !t.class_title_en
      ) {
        if (this._checkClassTitleUpdateRequired(result.lecture)) {
          await this.updateClassTitle(result.lecture);
        }
      }

      if (!(operations === 'create')) {
        //todo: cache delete
      }
    }
    return true;
  }

  static initialize(prisma: PrismaService) {
    if (!LectureMiddleware.instance) {
      LectureMiddleware.instance = new LectureMiddleware(prisma);
    }
  }

  static getInstance(): LectureMiddleware {
    return LectureMiddleware.instance;
  }

  private _checkClassTitleUpdateRequired(lecture: subject_lecture) {
    const isTitleEqual =
      lecture.common_title &&
      lecture.class_title &&
      [
        lecture.common_title + lecture.class_title,
        lecture.common_title,
      ].includes(lecture.title);
    const isTitleEnEqual =
      lecture.common_title_en &&
      lecture.class_title_en &&
      [
        lecture.common_title_en + lecture.class_title_en,
        lecture.common_title_en,
      ].includes(lecture.title_en);
    return !(isTitleEqual && isTitleEnEqual);
  }

  private async updateClassTitle(lecture: subject_lecture) {
    const lectures = await this.prisma.subject_lecture.findMany({
      where: {
        course_id: lecture.course_id,
        deleted: false,
        year: lecture.year,
        semester: lecture.semester,
      },
    });
    await this._addTitleFormat(lectures);
    await this._addTitleFormatEn(lectures);
  }

  private async _addTitleFormat(lectures: subject_lecture[]) {
    if (lectures.length === 1) {
      const title = lectures[0].title;
      const commonTitle = title.endsWith('>')
        ? title.substring(0, title.indexOf('<'))
        : title;
      await this.update(lectures, commonTitle, 'title');
    } else {
      const commonTitle = this.lcsFront(
        lectures.map((lecture) => lecture.title),
      );
      await this.update(lectures, commonTitle, 'title');
    }
  }

  private async _addTitleFormatEn(lectures: subject_lecture[]) {
    if (lectures.length === 1) {
      const title = lectures[0].title_en;
      const commonTitle = title.endsWith('>')
        ? title.substring(0, title.indexOf('<'))
        : title;
      await this.update(lectures, commonTitle, 'title_en');
    } else {
      const commonTitle = this.lcsFront(
        lectures.map((lecture) => lecture.title_en),
      );
      await this.update(lectures, commonTitle, 'title_en');
    }
  }

  private async update(
    lectures: subject_lecture[],
    commonTitle: string,
    updateType: 'title' | 'title_en',
  ) {
    await Promise.all(
      lectures.map(async (lecture) => {
        const titleField =
          updateType === 'title' ? lecture.title : lecture.title_en;
        const updateClassField =
          updateType === 'title' ? 'class_title' : 'class_title_en';
        const updateCommonField =
          updateType === 'title' ? 'common_title' : 'common_title_en';
        let classTitle: string;
        if (titleField != commonTitle) {
          classTitle = titleField.substring(commonTitle.length);
        } else if (lecture.class_no.length > 0) {
          classTitle = lecture.class_no;
        } else {
          classTitle = 'A';
        }
        return await this.prisma.subject_lecture.update({
          where: { id: lecture.id },
          data: {
            [updateCommonField]: commonTitle,
            [updateClassField]: classTitle,
          },
        });
      }),
    );
  }
  private lcsFront(lectureTitles: string[]): string {
    if (lectureTitles.length === 0) {
      return '';
    }
    let result = '';
    for (let i = lectureTitles[0].length; i > 0; i--) {
      const targetSubstring = lectureTitles[0].substring(0, i);
      if (lectureTitles.every((t) => t.substring(0, i) === targetSubstring)) {
        result = targetSubstring;
        break;
      }
    }
    // eslint-disable-next-line no-useless-escape
    result = result.replace(/[<(\[{]+$/, '');
    return result;
  }
}
