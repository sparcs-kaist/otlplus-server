import { Controller } from "@nestjs/common";
import { AuthService } from "./auth.service";

@Controller("session")
export class AuthController {
  constructor(
    private readonly authService: AuthService
  ) {
  }

}