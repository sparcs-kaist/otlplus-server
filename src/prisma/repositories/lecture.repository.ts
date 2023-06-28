import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma.service";

@Injectable()
export class LectureRepository{
  constructor(private readonly prisma: PrismaService){}

}