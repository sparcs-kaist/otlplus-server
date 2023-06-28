import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma.service";

@Injectable()
export class CourseRepository{
  constructor(private readonly prisma: PrismaService){}

}