import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { TJwtPayload } from 'src/modules/auth/types';
import { EUserRole } from '../enums';

interface IReqWithUser extends Request {
  user: TJwtPayload;
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<EUserRole[]>(
      'roles',
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) return true;

    const ctx = context.switchToHttp();
    const request = ctx.getRequest<IReqWithUser>();
    // const response = ctx.getResponse<Response>();

    const user = request.user;

    return requiredRoles.some((role) => user.roles.includes(role));
  }
}
