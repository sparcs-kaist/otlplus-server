import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { session_userprofile, subject_semester } from '@prisma/client';
import { CanvasRenderingContext2D } from 'canvas';
import { createCanvas, loadImage, registerFont } from 'canvas';
import { join } from 'path';
import { PrismaService } from 'src/prisma/prisma.service';
import { ITimetable } from 'src/common/interfaces';
import { TimetableRepository } from 'src/prisma/repositories/timetable.repository';
import { SemesterRepository } from 'src/prisma/repositories/semester.repository';
import { SemestersService } from '../semesters/semesters.service';

@Injectable()
export class ShareService {
  private readonly file_path =
    process.env.NODE_ENV === 'local' ? 'static/' : '/var/www/otlplus/static/';

  constructor(
    private readonly prismaService: PrismaService,
    private readonly timetableRepository: TimetableRepository,
    private readonly semesterRepository: SemesterRepository,
  ) {
    registerFont(join(this.file_path, 'fonts/NotoSansKR-Regular.otf'), {
      family: 'NotoSansKR',
    });
    registerFont(join(this.file_path, 'fonts/NotoSansKR-Regular.otf'), {
      family: 'NotoSansKR',
    });
  }

  private getSemesterName(
    semester: subject_semester,
    language: string = 'kr',
  ): string {
    const seasons = language.includes('en')
      ? ['spring', 'summer', 'fall', 'winter']
      : ['봄', '여름', '가을', '겨울'];

    const seasonName = seasons[semester.semester - 1];
    return `${semester.year} ${seasonName}`;
  }

  private drawRoundedRectangle(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number,
    color: string,
  ) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    ctx.fill();
  }

  private sliceTextToFitWidth(
    text: string,
    maxWidth: number,
    font: string,
    fontSize: number,
  ): string[] {
    const canvas = createCanvas(100, 100);
    const ctx = canvas.getContext('2d');
    ctx.font = `${fontSize}px '${font}'`;

    const words = text.split(' ');
    const lines = [];
    let currentLine = words[0];

    words.slice(1).forEach((word) => {
      const width = ctx.measureText(`${currentLine} ${word}`).width;
      if (width < maxWidth) {
        currentLine += ` ${word}`;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    });

    lines.push(currentLine); // Push the last line
    return lines;
  }

  private drawTextbox(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    text: string,
    font: string,
    fontSize: number,
    color: string,
    align?: 'right' | 'left',
  ) {
    const lines = this.sliceTextToFitWidth(text, width, font, fontSize);
    ctx.fillStyle = color;
    ctx.font = `${fontSize}px '${font}'`;
    ctx.textAlign = align ? align : 'left';
    if (align == 'right') ctx.fillText(text, x, y);
    else {
      lines.forEach((line, i) => {
        ctx.fillText(line, x, y + fontSize * (i + 1));
      });
    }
  }

  private getTimetableType(lectures: ITimetable.ILecture[]): '5days' | '7days' {
    return lectures.some((lecture) =>
      lecture.subject_classtime.some((classtime) => classtime.day >= 5),
    )
      ? '7days'
      : '5days';
  }

  // Make sure to adjust other methods that use lectures to match the type
  private async getTimetableEntries(
    timetableId: number,
  ): Promise<ITimetable.ILecture[]> {
    const timetableDetails =
      await this.timetableRepository.getLecturesWithClassTimes(timetableId);
    if (!timetableDetails) {
      throw new HttpException('No such timetable', HttpStatus.NOT_FOUND);
    }
    return timetableDetails.map((detail) => detail.subject_lecture);
  }

  async createTimetableImage(
    timetableId: number,
    year: number,
    semester: number,
    language: string,
    user: any,
  ): Promise<Buffer> {
    const TIMETABLE_CELL_COLORS = [
      '#F2CECE',
      '#F4B3AE',
      '#F2BCA0',
      '#F0D3AB',
      '#F1E1A9',
      '#f4f2b3',
      '#dbf4be',
      '#beedd7',
      '#b7e2de',
      '#c9eaf4',
      '#B4D3ED',
      '#B9C5ED',
      '#CCC6ED',
      '#D8C1F0',
      '#EBCAEF',
      '#f4badb',
    ];
    const semesterFontSize = 30;
    const tileFontSize = 24;

    const lectures = await this.getTimetableEntries(timetableId);
    const timetableType = this.getTimetableType(lectures);
    const imageTemplatePath = join(
      this.file_path,
      `img/Image_template_${timetableType}.png`,
    );

    const baseImage = await loadImage(imageTemplatePath);
    const canvas = createCanvas(baseImage.width, baseImage.height);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(baseImage, 0, 0);

    const semesterObject = await this.semesterRepository.findSemester(
      year,
      semester,
    );
    if (!semesterObject) {
      throw new HttpException('Semester not found', HttpStatus.NOT_FOUND);
    }
    const isEnglish = language && language.includes('en');
    const semesterName = this.getSemesterName(
      semesterObject,
      isEnglish ? 'en' : 'kr',
    );
    this.drawTextbox(
      ctx,
      timetableType === '5days' ? 952 : 952 + 350,
      78,
      200,
      semesterName,
      'NotoSansKR',
      semesterFontSize,
      '#CCCCCC',
      'right',
    );

    lectures.forEach((lecture) => {
      const color = TIMETABLE_CELL_COLORS[lecture.course_id % 16];
      lecture.subject_classtime.forEach((classtime) => {
        const { day, begin, end } = classtime;
        const beginNumber = begin.getUTCHours() * 60 + begin.getUTCMinutes();
        const endNumber = end.getUTCHours() * 60 + end.getUTCMinutes();
        console.log(day, begin, end, beginNumber, endNumber);

        const [x, y, width, height] = [
          178 * day + 76,
          (beginNumber * 4) / 3 - 486,
          178 - 7,
          ((endNumber - beginNumber) * 4) / 3 - 7,
        ];

        // const [x, y, width, height] = [100, 100, 200, 60]; // Placeholder values

        this.drawRoundedRectangle(ctx, x, y, width, height, 10, color);
        this.drawTextbox(
          ctx,
          x + 10,
          y + 10,
          width - 20,
          lecture.title,
          'NotoSansKR',
          tileFontSize,
          '#000',
        );
      });
    });

    // Return the image as a buffer
    return canvas.toBuffer();
    // return canvas.createPNGStream();
  }
}
