import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Request } from 'express';
import { Observable, map } from 'rxjs';
import { TJwtPayload } from 'src/modules/auth/types';

interface IReqWithUser extends Request {
  user: TJwtPayload;
}

interface IReqBody {
  userId?: string;
  currentUserId?: string;
}

@Injectable()
export class ExtractIdInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<IReqWithUser>();

    const userId = (request.body as IReqBody).userId;

    if (!userId) {
      (request.body as IReqBody).currentUserId = request.user.sub;
    }

    return next.handle();
  }

  extractHandler(context: ExecutionContext) {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();

    console.log(request);
  }
}
