import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma.service";

@Injectable()
export class UserRepository{
  constructor(private readonly prisma: PrismaService){}

  async findBySid(sid: string){
    return await this.prisma.session_userprofile.findFirst({
      where: { sid: sid }
    })
  }
}