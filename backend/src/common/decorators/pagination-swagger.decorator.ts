import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiQuery } from '@nestjs/swagger';

interface IOperation {
  summary: string;
  description?: string;
}

export const ApiPagination = (operation: IOperation) =>
  applyDecorators(
    ApiOperation({
      summary: operation.summary,
      description: operation.description,
    }),
    ApiQuery({
      name: 'page',
      type: Number,
      description: 'Número de página para la paginación',
      required: false,
    }),
    ApiQuery({
      name: 'size',
      type: Number,
      description: 'Número de elementos por página',
      required: false,
    }),
  );
