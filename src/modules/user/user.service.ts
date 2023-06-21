import { UserRepository } from "../../prisma/repositories/user.repository";
import { Injectable, NotFoundException } from "@nestjs/common";

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {
  }

  public async findBySid(sid: string){
    const user =  this.userRepository.findBySid(sid);
    if (!user) {
      throw new NotFoundException(`Can't find user with sid: ${sid}`);
    }
  }
}