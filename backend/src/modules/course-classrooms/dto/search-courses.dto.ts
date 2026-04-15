import { IsOptional, IsString, MinLength } from 'class-validator';
import { QueryPaginationDto } from 'src/common/dto';

export class SearchCoursesDto extends QueryPaginationDto {
  @IsString()
  @MinLength(2, {
    message: 'El mínimo de caracteres de búsqueda es de 2.',
  })
  searchTerm: string;

  @IsOptional()
  @IsString()
  centerDepartmentId?: string;
}
