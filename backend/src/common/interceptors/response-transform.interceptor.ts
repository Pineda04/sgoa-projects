import {
  CallHandler,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { format } from 'date-fns';
import { catchError, map, Observable, throwError } from 'rxjs';
import { Reflector } from '@nestjs/core';
import { RESPONSE_MESSAGE_METADATA } from '../decorators';
import { Prisma } from 'src/generated/prisma/client';

export interface IResponse<T> {
  status: boolean;
  statusCode: number;
  path: string;
  message: string;
  data: T;
  meta?: {
    total?: number;
    lastPage?: number;
    currentPage?: number;
    totalPerPage?: number;
    prevPage?: number | null;
    nextPage?: number | null;
  };
  timestamp: string;
}

interface IResponseWithMeta<T> {
  data: T;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
  };
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<
  T,
  IResponse<T>
> {
  private readonly METHOD_TRANSLATIONS: Record<string, string> = {
    POST: 'crear',
    PUT: 'actualizar',
    PATCH: 'modificar',
    DELETE: 'eliminar',
    GET: 'obtener',
  };

  constructor(private reflector: Reflector) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<IResponse<T>> {
    return next.handle().pipe(
      map((res) => this.responseHandler<T>(res, context)),
      catchError((err: HttpException | Prisma.PrismaClientKnownRequestError) =>
        throwError(() => this.errorHandler(err, context)),
      ),
    );
  }

  errorHandler(
    exception: HttpException | Prisma.PrismaClientKnownRequestError,
    context: ExecutionContext,
  ) {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // const [status, message] =
    //   exception instanceof HttpException // if
    //     ? [exception.getStatus(), exception.message]
    //     : exception instanceof Prisma.PrismaClientKnownRequestError // elseif
    //       ? this.getPrismaError(request, exception)
    //       : [HttpStatus.INTERNAL_SERVER_ERROR, 'Error internal server.'];

    let {
      status,
      message,
    }: {
      status: number;
      message: string;
    } = {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: exception.message || 'Error interno del servidor',
    };

    if (exception instanceof HttpException) {
      // res = { status: exception.getStatus(), message: exception.message };
      status = exception.getStatus();
      message = exception.message;
    }

    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      status = this.getPrismaError(request, exception).status;
      message = this.getPrismaError(request, exception).message;
    }

    interface IHEWithMessage extends HttpException {
      message: string;
    }

    const exceptionResponse =
      exception instanceof HttpException ? exception.getResponse() : null;

    const resultMessage =
      exception instanceof HttpException && exceptionResponse
        ? (exceptionResponse as IHEWithMessage).message === message
          ? []
          : (exceptionResponse as IHEWithMessage).message
        : [];

    const uniqueMessages = [...new Set(resultMessage)];

    const additionalData: Record<string, unknown> = {};
    if (exceptionResponse && typeof exceptionResponse === 'object') {
      const responseObj = exceptionResponse as Record<string, unknown>;
      Object.keys(responseObj).forEach((key) => {
        if (key !== 'message' && key !== 'error') {
          additionalData[key] = responseObj[key];
        }
      });
    }

    console.log(exception.message);

    const dataPayload =
      Object.keys(additionalData).length > 0
        ? {
            ...additionalData,
            ...(uniqueMessages.length > 0 ? { errors: uniqueMessages } : {}),
          }
        : uniqueMessages;

    response.status(status).json({
      status: status >= 200 && status < 300,
      statusCode: status,
      path: request.url,
      message,
      data: dataPayload,
      timestamp: format(new Date().toISOString(), 'yyyy-MM-dd HH:mm:ss'),
    });
  }

  responseHandler<T>(
    res: IResponseWithMeta<T>,
    context: ExecutionContext,
  ): IResponse<T> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const message =
      this.reflector.get<string>(
        RESPONSE_MESSAGE_METADATA,
        context.getHandler(),
      ) || 'success';

    return {
      status: true,
      statusCode: response.statusCode,
      path: request.url,
      message,
      data: res?.data ?? (res as T),
      meta: res?.meta,
      timestamp: format(new Date().toISOString(), 'yyyy-MM-dd HH:mm:ss'),
    };
  }

  getPrismaError(
    request: Request,
    exception: Prisma.PrismaClientKnownRequestError,
  ): {
    status: number;
    message: string;
  } {
    const { modelName, target } =
      (exception.meta! as {
        modelName: string;
        target: string[];
      }) || {};

    switch (exception.code) {
      case 'P2002': {
        const status = HttpStatus.CONFLICT;
        const fields = Array.isArray(target) ? target.join(', ') : target;

        const message = `El valor proporcionado para <${fields}> ya está en uso. Por favor, elige un nombre diferente para ${this.METHOD_TRANSLATIONS[request.method]} el registro de <${modelName}>`;

        // break;
        return {
          status,
          message,
        };
      }

      case 'P2025': {
        const status = HttpStatus.NOT_FOUND;
        const message = `No se encontraron registros con el id <${
          request.params['id']
        }> en el modelo <${modelName}>.`;

        // break;
        return {
          status,
          message,
        };
      }

      case 'P2003': {
        return {
          status: HttpStatus.BAD_REQUEST,
          message: `No se puede ${this.METHOD_TRANSLATIONS[request.method] || 'procesar'} el ${modelName} debido a una restricción de clave externa`,
        };
      }

      default:
        // break;
        return {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: exception.message,
        };
    }
  }
}
