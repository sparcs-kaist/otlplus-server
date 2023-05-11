import { PrismaService } from "../../prisma/prisma.service";
import { Injectable } from "@nestjs/common";
import { UserRepository } from "../../prisma/repositories/user.repository";

@Injectable()
export class AuthService{
    constructor(
        private readonly prisma: PrismaService,
        private readonly userRepository: UserRepository,
    ){}
}