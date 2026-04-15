import {
  CallHandler,
  ExecutionContext,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { IReqWithUser } from '../interfaces';
import { Response } from 'express';

export class RequestLoggerInterceptor implements NestInterceptor {
  private logger = new Logger('RequestLogger');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<IReqWithUser>();
    const response = ctx.getResponse<Response>();

    const { ip, method, originalUrl, user } = request;

    const userAgent = request.get('user-agent') || '';
    const userId = user ? `userId=${user.sub}` : 'anonymous';
    const now = Date.now();

    return next.handle().pipe(
      tap(() => {
        const { statusCode } = response;
        const duration = Date.now() - now;

        this.logger.log(
          `${userId} ${method} ${originalUrl} ${statusCode} - ${userAgent} ${ip} +${duration}ms`,
        );
      }),
    );
  }
}
