import { PrismaService } from "../../prisma/prisma.service";
import { Injectable } from "@nestjs/common";
import { UserRepository } from "../../prisma/repositories/user.repository";
import { session_userprofile } from "@prisma/client";

@Injectable()
export class AuthService{
    constructor(
        private readonly userRepository: UserRepository,
    ){}

    public async findBySid(sid: string){
        return this.userRepository.findBySid(sid);
    }

}