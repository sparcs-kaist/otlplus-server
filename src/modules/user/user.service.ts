import { UserRepository } from "../../prisma/repositories/user.repository";
import { NotFoundException } from "@nestjs/common";

export class UserService {
  constructor(private readonly userRepository: UserRepository) {
  }

  public async findBySid(sid: string){
    const user =  this.userRepository.findBySid(sid);
    if (!user) {
      throw new NotFoundException(`Can't find user with sid: ${sid}`);
    }  }
}