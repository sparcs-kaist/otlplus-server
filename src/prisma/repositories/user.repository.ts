import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import { session_userprofile, Prisma} from "@prisma/client";

@Injectable()
export class UserRepository{
  constructor(private readonly prisma: PrismaService){}

  async findBySid(sid: string){
    return await this.prisma.session_userprofile.findFirst({
      where: { sid: sid }
    })
  }

  async createUser(user: Prisma.session_userprofileCreateInput): Promise<session_userprofile>{
    return await this.prisma.session_userprofile.create({
      data: user
    })
  }

  async updateUser(userId, user: Prisma.session_userprofileUpdateInput): Promise<session_userprofile>{
    return await this.prisma.session_userprofile.update({
      data: user,
      where: { id : userId }
    })
  }
}