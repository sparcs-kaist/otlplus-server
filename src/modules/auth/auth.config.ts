import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { JwtCommand } from './command/jwt.command';
import { SidCommand } from './command/sid.command';
import { IsPublicCommand } from './command/isPublic.command';
import { AuthChain } from './auth.chain';

export class AuthConfig {
  constructor(
    private authChain: AuthChain,
    private readonly jwtCommand: JwtCommand,
    private readonly sidCommand: SidCommand,
    private readonly isPublicCommand: IsPublicCommand,
  ) {}

  public async config(env: string) {
    if (env == 'local') return this.getLocalGuardConfig();
    if (env == 'dev') return this.getDevGuardConfig();
    if (env == 'prod') return this.getProdGuardConfig();
    else return this.getLocalGuardConfig();
  }
  private getLocalGuardConfig = () => {
    return this.authChain
      .register(this.sidCommand)
      .register(this.jwtCommand)
      .register(this.isPublicCommand);
  };

  private getDevGuardConfig = () => {
    return this.authChain
      .register(this.sidCommand)
      .register(this.jwtCommand)
      .register(this.isPublicCommand);
  };

  private getProdGuardConfig = () => {
    return this.authChain
      .register(this.jwtCommand)
      .register(this.isPublicCommand);
  };
}
