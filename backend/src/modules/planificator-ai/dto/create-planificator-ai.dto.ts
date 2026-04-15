import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsUUID,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CourseInfoDto {
  @ApiProperty({
    description: 'ID del curso.',
    example: 'a5854c2b-6547-4109-9208-97ee4cc64555',
    required: true,
  })
  @IsUUID('all', { message: 'El campo <courseId> debe ser un UUID válido.' })
  @IsNotEmpty({ message: 'El campo <courseId> no debe estar vacío.' })
  courseId: string;

  @ApiProperty({
    description: 'Indica si el curso requiere laboratorio.',
    example: false,
    required: false,
    default: false,
  })
  @IsBoolean({ message: 'El campo <labRequired> debe ser un valor booleano.' })
  labRequired: boolean = false;

  @ApiProperty({
    description: 'Número estimado de estudiantes inscritos en el curso.',
    example: 25,
    required: false,
    default: 0,
    minimum: 0,
    maximum: 300,
  })
  @IsInt({
    message: 'El campo <estimatedStudentsCount> debe ser un número entero.',
  })
  @Min(0, { message: 'El número de estudiantes no puede ser negativo.' })
  @Max(300, { message: 'El número de estudiantes no puede superar 300.' })
  estimatedStudentsCount: number = 0;
}

export class CreatePlanificatorAiDto {
  @ApiProperty({
    description: 'ID del centro-departmento a generar la planificación.',
    example: '65039ef6-1fc5-474c-b4e3-27239c200138',
    required: true,
  })
  @IsUUID('all', {
    each: true,
    message: 'La propiedad <centerDepartmentId> debe ser un UUID válido.',
  })
  @IsNotEmpty({
    message: 'La propiedad <centerDepartmentId> no debe estar vacía.',
  })
  centerDepartmentId: string;

  @ApiProperty({
    description:
      'Información de los cursos para generar la planificación académica (máximo 15).',
    type: [CourseInfoDto],
    maxItems: 15,
    required: true,
    nullable: false,
    example: [
      {
        courseId: 'a5854c2b-6547-4109-9208-97ee4cc64555',
        labRequired: true,
        estimatedStudentsCount: 25,
      },
      {
        courseId: '748e42de-4125-4acd-b551-a9cbdd422dc9',
        labRequired: false,
        estimatedStudentsCount: 40,
      },
    ],
  })
  @IsArray({
    message:
      'La propiedad <courses> debe ser un arreglo de objetos CourseInfoDto.',
  })
  @ValidateNested({ each: true })
  @Type(() => CourseInfoDto)
  // @ArrayMaxSize(15, { message: 'Solo se permiten máximo 15 cursos.' })
  courses: CourseInfoDto[];
}
