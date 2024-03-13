import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { timetable_timetable_lectures } from '@prisma/client';
import { createCanvas, loadImage, registerFont } from 'canvas';
import { join } from 'path';
import { PrismaService } from 'src/prisma/prisma.service';
import { TimetableRepository } from 'src/prisma/repositories/timetable.repository';

@Injectable()
export class ShareService {
  private readonly TIMETABLE_CELL_COLORS = ['#color1', '#color2'];
  private readonly file_path =
    process.env.NODE_ENV === 'development'
      ? 'static/'
      : '/var/www/otlplus/static/';

  constructor(
    private readonly prismaService: PrismaService,
    private readonly timetableRepository: TimetableRepository,
  ) {
    registerFont(join(this.file_path, 'fonts/NotoSansKR-Regular.otf'), {
      family: 'NotoSansKR',
    });
  }

  private getTimetableType(lectures: any[]): 'FIVE_DAYS' | 'SEVEN_DAYS' {
    return lectures.some((lecture: { classtimes: { day: number }[] }) =>
      lecture.classtimes.some(
        (classtime: { day: number }) => classtime.day >= 5,
      ),
    )
      ? 'SEVEN_DAYS'
      : 'FIVE_DAYS';
  }

  private drawRoundedRectangle(
    ctx: {
      fillStyle: string;
      beginPath: () => void;
      moveTo: (arg0: number, arg1: number) => void;
      lineTo: (arg0: number, arg1: number) => void;
      quadraticCurveTo: (
        arg0: number,
        arg1: number,
        arg2: number,
        arg3: number,
      ) => void;
      closePath: () => void;
      fill: () => void;
    },
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
    ctx: {
      fillStyle: string;
      font: string;
      fillText: (arg0: string, arg1: number, arg2: number) => void;
    },
    x: number,
    y: number,
    width: number,
    height: number,
    text: string,
    font: string,
    fontSize: number,
    color: string,
  ) {
    const lines = this.sliceTextToFitWidth(text, width, font, fontSize);
    ctx.fillStyle = color;
    ctx.font = `${fontSize}px '${font}'`;
    lines.forEach((line, i) => {
      ctx.fillText(line, x, y + fontSize * (i + 1));
    });
  }

  async createTimetableImage(
    timetableId: number,
    year: number,
    semester: number,
    language: string,
  ) {
    const timetableDetails =
      await this.timetableRepository.getLecturesWithClassTimes(timetableId);
    if (!timetableDetails) {
      throw new HttpException('No such timetable', HttpStatus.NOT_FOUND);
    }

    const lectures = timetableDetails;
    const timetableType = this.getTimetableType(lectures);
    const imageTemplatePath = join(
      this.file_path,
      `img/Image_template_${timetableType}.png`,
    );
    const image = await loadImage(imageTemplatePath);
    const canvas = createCanvas(image.width, image.height);
    const ctx = canvas.getContext('2d');

    // Draw the base image
    ctx.drawImage(image, 0, 0, image.width, image.height);

    // Continue with drawing logic, similar to the Python example provided
    // ...

    return canvas.createPNGStream();
  }
}
