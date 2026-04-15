import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { TJwtPayloadWithRt } from 'src/modules/auth/types';

export const GetCurrentUser = createParamDecorator(
  (data: keyof TJwtPayloadWithRt | undefined, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();

    if (!data) return request.user;

    return request.user[data];
  },
);
