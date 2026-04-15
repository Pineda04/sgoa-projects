import { IsNumberString, IsOptional } from 'class-validator';

export class QueryPaginationDto {
  @IsOptional()
  @IsNumberString(
    {},
    {
      message: 'El valor de <page> debe ser un número.',
    },
  )
  page?: string;

  @IsOptional()
  @IsNumberString(
    {},
    {
      message: 'El valor de <size> debe ser un número.',
    },
  )
  size?: string;
}
