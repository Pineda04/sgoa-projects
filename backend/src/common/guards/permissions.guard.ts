import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { TJwtPayload } from 'src/modules/auth/types';
import { PERMISSION_KEY } from '../decorators/require-permission.decorator';
import { TPermissionAction, TPermissionSubject } from '../constants';

interface IReqWithUser extends Request {
  user: TJwtPayload;
}

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<{
      action: TPermissionAction;
      subject: TPermissionSubject;
    }>(PERMISSION_KEY, [context.getHandler(), context.getClass()]);

    if (!required) return true;

    const ctx = context.switchToHttp();
    const request = ctx.getRequest<IReqWithUser>();
    const user = request.user;

    if (user.isSuperAdmin) return true;

    const needed = `${required.action}:${required.subject}`;
    const managed = `manage:${required.subject}`;

    return (
      user.permissions?.some((p) => p === needed || p === managed) ?? false
    );
  }
}
