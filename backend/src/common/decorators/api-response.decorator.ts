import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiCreatedResponse,
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
} from '@nestjs/swagger';

interface IApiOperationOptions {
  summary: string;
  description?: string;
  okDescription?: string;
  createdDescription?: string;
  badRequestDescription?: string;
  internalErrorDescription?: string;
  notFoundDescription?: string;
}

export const ApiCommonResponses = (operation: IApiOperationOptions) => {
  const decorators = [
    ApiOperation({
      summary: operation.summary,
      description: operation.description,
    }),
    operation.okDescription &&
      ApiOkResponse({ description: operation.okDescription }),
    operation.createdDescription &&
      ApiCreatedResponse({ description: operation.createdDescription }),
    ApiBadRequestResponse({
      description: operation.badRequestDescription || 'Solicitud inválida.',
    }),
    ApiInternalServerErrorResponse({
      description:
        operation.internalErrorDescription || 'Error interno del servidor.',
    }),
    ApiNotFoundResponse({
      description: operation.notFoundDescription || 'Recurso no encontrado.',
    }),
  ].filter(Boolean) as Array<
    ClassDecorator | MethodDecorator | PropertyDecorator
  >;

  return applyDecorators(...decorators);
};
