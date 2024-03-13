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
import { LecturesService } from '../lectures/lectures.service';

@Injectable()
export class ShareService {
  private readonly file_path =
    process.env.NODE_ENV === 'local' ? 'static/' : '/var/www/otlplus/static/';

  constructor(
    private readonly prismaService: PrismaService,
    private readonly timetableRepository: TimetableRepository,
    private readonly semesterRepository: SemesterRepository,
    private readonly lecturesService: LecturesService, // LecturesService 추가
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

  private drawText(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    text: string,
    font: string,
    fontSize: number,
    color: string,
    align?: 'right' | 'left' | 'center',
  ) {
    ctx.fillStyle = color;
    ctx.font = `${fontSize}px '${font}'`;
    ctx.textAlign = align ? align : 'left';
    ctx.fillText(text, x, y);
  }

  private drawTile(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    title: string,
    professor: string,
    location: string,
    font: string,
    fontSize: number,
  ) {
    const slicedTitle = this.sliceTextToFitWidth(title, width, font, fontSize);
    const slicedProfessor = this.sliceTextToFitWidth(
      professor,
      width,
      font,
      fontSize,
    );
    const slicedLocation = this.sliceTextToFitWidth(
      location,
      width,
      font,
      fontSize,
    );

    let textTotalHeight = 0;
    const slices: string[] = [
      ...slicedTitle,
      '',
      ...slicedProfessor,
      '',
      ...slicedLocation,
    ];

    // Calculate total height for text
    textTotalHeight = slices.reduce((total, slice, index) => {
      if (slice === '') return total + 2; // space between sections
      return total + fontSize;
    }, 0);

    const topPad = (height - textTotalHeight) / 2;
    let offsetY = topPad + fontSize;

    slices.forEach((slice, index) => {
      if (slice !== '') {
        this.drawText(
          ctx,
          x,
          y + offsetY,
          slice,
          font,
          fontSize,
          'rgba(0, 0, 0, ' + (index < slicedTitle.length ? 0.8 : 0.5) + ')', // Adjust opacity
          'left',
        );
        offsetY += fontSize;
      } else {
        offsetY += 2; // Adding space between sections
      }
    });
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
    const isEnglish: boolean = !!language && language.includes('en');
    const semesterName = this.getSemesterName(
      semesterObject,
      isEnglish ? 'en' : 'kr',
    );
    this.drawText(
      ctx,
      timetableType === '5days' ? 952 : 952 + 350,
      78,
      semesterName,
      'NotoSansKR',
      semesterFontSize,
      '#CCCCCC',
      'right',
    );

    // 강의 정보를 순차적으로 처리
    for (const lecture of lectures) {
      const color = TIMETABLE_CELL_COLORS[lecture.course_id % 16];

      // 각 강의 시간에 대해 비동기 처리
      for (const classtime of lecture.subject_classtime) {
        const { day, begin, end } = classtime;
        const beginNumber = begin.getUTCHours() * 60 + begin.getUTCMinutes();
        const endNumber = end.getUTCHours() * 60 + end.getUTCMinutes();

        const [x, y, width, height] = [
          178 * day + 76,
          (beginNumber * 4) / 3 - 486,
          178 - 7,
          ((endNumber - beginNumber) * 4) / 3 - 7,
        ];

        this.drawRoundedRectangle(ctx, x, y, width, height, 10, color);

        // 교수님 이름과 강의실 정보를 비동기적으로 가져온 후 타일 그리기
        const professorShortStr =
          await this.lecturesService.getProfessorShortStr(
            lecture.id,
            isEnglish,
          );
        const classroomShortStr =
          await this.lecturesService.getClassroomShortStr(
            lecture.id,
            isEnglish,
          );

        this.drawTile(
          ctx,
          x + 12,
          y + 8,
          width - 24,
          height - 16,
          isEnglish ? lecture.title_en : lecture.title,
          professorShortStr,
          classroomShortStr,
          'NotoSansKR',
          tileFontSize,
        );
      }
    }

    // Return the image as a buffer
    return canvas.toBuffer();
    // return canvas.createPNGStream();
  }
}
