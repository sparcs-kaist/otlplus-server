import { ExecutionContext } from '@nestjs/common';

export interface AuthResult {
  authentication: boolean;
  authorization: boolean;
  isPublic: boolean;
}

export interface AuthCommand {
  next(context: ExecutionContext, prevResult: AuthResult): Promise<AuthResult>;
}
