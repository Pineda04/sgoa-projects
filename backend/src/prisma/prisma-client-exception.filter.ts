import { ArgumentsHost, Catch, HttpStatus } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Prisma } from 'src/generated/prisma/client';
import { Request, Response } from 'express';

enum EMethodsTranslated {
  POST = 'crear',
  PUT = 'actualizar',
  PATCH = 'modificar',
}

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaClientExceptionFilter extends BaseExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    console.error(exception.message);

    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // const message = exception.message.replace(/\n/g, '');
    const { modelName, target } = exception.meta! as {
      modelName: string;
      target: string[];
    };

    switch (exception.code) {
      case 'P2002': {
        const status = HttpStatus.CONFLICT;
        const fields = Array.isArray(target) ? target.join(', ') : target;

        response.status(status).json({
          statusCode: status,
          // message: `Hay una violación de restricciones única, un nuevo registro <${modelName}> no puede ser creado con ${fields}.`,
          message: `El valor proporcionado para <${fields}> ya está en uso. Por favor, elige un nombre diferente para ${EMethodsTranslated[request.method]} el registro de <${modelName}>`,
        });

        break;
      }

      case 'P2025': {
        const status = HttpStatus.NOT_FOUND;

        response.status(status).json({
          statusCode: status,
          // message: message,
          message: `No se encontraron registros con el id <${
            request.params['id']
          }> en el modelo <${modelName}>.`,
        });

        break;
      }

      default:
        // default 500 error code
        super.catch(exception, host);

        break;
    }
  }
}
