import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma.service";

@Injectable()
export class ReviewRepository{
  constructor(private readonly prisma: PrismaService){}

}