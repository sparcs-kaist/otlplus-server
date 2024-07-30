import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { session_userprofile } from '@prisma/client';
import {
  CanvasRenderingContext2D,
  createCanvas,
  loadImage,
  registerFont,
} from 'canvas';
import { join } from 'path';
import { ELecture } from 'src/common/entities/ELecture';
import { IShare } from 'src/common/interfaces';
import { SemesterRepository } from 'src/prisma/repositories/semester.repository';
import { LecturesService } from '../lectures/lectures.service';
import { SemestersService } from '../semesters/semesters.service';
import { TimetablesService } from '../timetables/timetables.service';

interface RoundedRectangleOptions {
  ctx: CanvasRenderingContext2D;
  x: number;
  y: number;
  width: number;
  height: number;
  radius: number;
  color: string;
}

interface TextOptions {
  ctx: CanvasRenderingContext2D;
  x: number;
  y: number;
  text: string;
  font: string;
  fontSize: number;
  color: string;
  align?: 'right' | 'left' | 'center'; // Optional parameter
}

interface DrawTileOptions {
  ctx: CanvasRenderingContext2D;
  x: number;
  y: number;
  width: number;
  height: number;
  title: string;
  professor: string;
  location: string;
  font: string;
  fontSize: number;
}

interface DrawTimetableDatas {
  lectures: ELecture.WithClasstime[];
  timetableType: string;
  semesterName: string;
  isEnglish: boolean;
  semesterFontSize: number;
  tileFontSize: number;
}

@Injectable()
export class ShareService {
  private readonly file_path =
    process.env.NODE_ENV === 'local'
      ? 'static/'
      : '/var/www/otlplus-server/static/';

  constructor(
    private readonly semesterRepository: SemesterRepository,
    private readonly lecturesService: LecturesService, // LecturesService 추가
    private readonly semestersService: SemestersService,
    private readonly timetablesService: TimetablesService,
  ) {
    registerFont(join(this.file_path, 'fonts/NotoSansKR-Regular.otf'), {
      family: 'NotoSansKR',
    });
    registerFont(join(this.file_path, 'fonts/NotoSansKR-Regular.otf'), {
      family: 'NotoSansKR',
    });
  }

  private drawRoundedRectangle(options: RoundedRectangleOptions) {
    const { ctx, x, y, width, height, radius, color } = options;
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

    let currentLine = '';
    const lines = [];

    for (const char of text) {
      const testLine = currentLine + char;
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;
      if (testWidth > maxWidth && currentLine !== '') {
        lines.push(currentLine);
        currentLine = char;
      } else {
        currentLine = testLine;
      }
    }

    if (currentLine) {
      lines.push(currentLine);
    }

    return lines;
  }

  private drawText(options: TextOptions) {
    const { ctx, x, y, text, font, fontSize, color, align = 'left' } = options; // Default alignment to 'left'
    ctx.fillStyle = color;
    ctx.font = `${fontSize}px '${font}'`;
    ctx.textAlign = align ? align : 'left';
    ctx.fillText(text, x, y);
  }

  private drawTile(options: DrawTileOptions) {
    const {
      ctx,
      x,
      y,
      width,
      height,
      title,
      professor,
      location,
      font,
      fontSize,
    } = options;
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
      ...slicedLocation,
      ...slicedProfessor,
    ].slice(0, 3);

    // Calculate total height for text
    textTotalHeight = slices.reduce((total, slice, index) => {
      if (slice === '') return total + 2; // space between sections
      return total + fontSize;
    }, 0);

    const topPad = (height - textTotalHeight) / 2;
    let offsetY = topPad + fontSize - 7;

    slices.forEach((slice, index) => {
      if (slice !== '') {
        this.drawText({
          ctx,
          x,
          y: y + offsetY,
          text: slice,
          font,
          fontSize,
          color:
            'rgba(0, 0, 0, ' + (index < slicedTitle.length ? 0.8 : 0.5) + ')', // Adjust opacity
        });
        offsetY += fontSize + 5;
      } else {
        offsetY += 2; // Adding space between sections
      }
    });
  }

  private async drawTimetable(
    drawTimetableData: DrawTimetableDatas,
  ): Promise<Buffer> {
    const {
      lectures,
      timetableType,
      semesterName,
      isEnglish,
      semesterFontSize,
      tileFontSize,
    } = drawTimetableData;
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

    const imageTemplatePath = join(
      this.file_path,
      `img/Image_template_${timetableType}.png`,
    );
    const baseImage = await loadImage(imageTemplatePath);
    const canvas = createCanvas(baseImage.width, baseImage.height);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(baseImage, 0, 0);

    // Draw semester name
    this.drawText({
      ctx,
      x: timetableType === '5days' ? 952 : 1302,
      y: 78,
      text: semesterName,
      font: 'NotoSansKR',
      fontSize: semesterFontSize,
      color: '#CCCCCC',
      align: 'right',
    });

    // Draw lectures
    for (const lecture of lectures) {
      const color = TIMETABLE_CELL_COLORS[lecture.course_id % 16];

      for (const classtime of lecture.subject_classtime) {
        // Time and position calculations
        const { day, begin, end } = classtime;
        const beginNumber = begin.getUTCHours() * 60 + begin.getUTCMinutes();
        const endNumber = end.getUTCHours() * 60 + end.getUTCMinutes();

        const [x, y, width, height] = [
          178 * day + 76,
          (beginNumber * 4) / 3 - 486,
          178 - 7,
          ((endNumber - beginNumber) * 4) / 3 - 7,
        ];

        // Draw each lecture tile
        this.drawRoundedRectangle({
          ctx,
          x,
          y,
          width,
          height,
          radius: 4,
          color,
        });

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

        this.drawTile({
          ctx,
          x: x + 12,
          y: y + 8,
          width: width - 24,
          height: height - 16,
          title: isEnglish ? lecture.title_en : lecture.title,
          professor: professorShortStr,
          location: classroomShortStr,
          font: 'NotoSansKR',
          fontSize: tileFontSize,
        });
      }
    }

    return canvas.toBuffer('image/png');
  }

  async createTimetableImage(
    query: IShare.TimetableImageQueryDto,
    user: session_userprofile,
  ): Promise<Buffer> {
    const lectures = await this.timetablesService.getTimetableEntries(
      query.timetable,
      query.year,
      query.semester,
      user,
    );
    const timetableType = this.timetablesService.getTimetableType(lectures);
    const semesterObject = await this.semesterRepository.findSemester(
      query.year,
      query.semester,
    );

    if (!semesterObject) {
      throw new HttpException('Semester not found', HttpStatus.NOT_FOUND);
    }

    const isEnglish = !!query.language && query.language.includes('en');
    const semesterName = await this.semestersService.getSemesterName(
      semesterObject,
      isEnglish ? 'en' : 'kr',
    );

    // 데이터 전처리 로직
    const drawTimetableData = {
      lectures,
      timetableType,
      semesterName,
      isEnglish,
      semesterFontSize: 30,
      tileFontSize: 24,
    };

    return this.drawTimetable(drawTimetableData);
  }
}
