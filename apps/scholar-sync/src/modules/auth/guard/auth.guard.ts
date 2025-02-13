import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { AuthChain } from '../auth.chain';

export class AuthGuard implements CanActivate {
  constructor(private readonly authChain: AuthChain) {}

  async canActivate(context: ExecutionContext) {
    return this.authChain.execute(context);
  }
}
