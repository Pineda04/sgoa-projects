import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { TJwtPayload } from 'src/modules/auth/types';

interface IReqWithUser extends Request {
  user: TJwtPayload;
}

export const GetCurrentUserId = createParamDecorator(
  (_data: undefined, context: ExecutionContext): string => {
    const request = context.switchToHttp().getRequest<IReqWithUser>();
    const user = request.user;

    return user.sub;
  },
);
