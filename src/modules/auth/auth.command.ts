import { ExecutionContext } from '@nestjs/common';

export interface AuthCommand {
  next(
    context: ExecutionContext,
    prevResult: boolean,
  ): Promise<[boolean, boolean]>;
}
