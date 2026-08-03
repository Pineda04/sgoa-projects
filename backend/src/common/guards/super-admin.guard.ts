import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { TJwtPayload } from 'src/modules/auth/types';
import { SUPER_ADMIN_ONLY_KEY } from '../decorators/super-admin-only.decorator';

interface IReqWithUser extends Request {
  user: TJwtPayload;
}

@Injectable()
export class SuperAdminGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isSuperAdminOnly = this.reflector.getAllAndOverride<boolean>(
      SUPER_ADMIN_ONLY_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!isSuperAdminOnly) return true;

    const ctx = context.switchToHttp();
    const request = ctx.getRequest<IReqWithUser>();
    const user = request.user;

    if (!user.isSuperAdmin)
      throw new ForbiddenException(
        'Solo un super administrador puede realizar esta acción.',
      );

    return true;
  }
}
