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

  public async import_student_lectures(studentId: string): Promise<void> {
    /*
    @Todo
    implement this function.
    this function uses sort of python script. I don't know what it is -larry
     */
  }
}