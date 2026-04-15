import { ApiProperty, OmitType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsOptional, ValidateNested } from 'class-validator';

export class AcademicAssignmentDto {
  @ApiProperty({
    example: 1,
    required: false,
    description: 'ID numérico de la asignación académica.',
    nullable: true,
  })
  @IsOptional()
  id?: number | null;

  @ApiProperty({
    example: 'DOC123',
    required: true,
    description: 'Código del docente asignado.',
  })
  @IsNotEmpty({ message: 'La propiedad <teacherCode> no debe estar vacía.' })
  teacherCode: string;

  @ApiProperty({
    example: 'Juan Pérez',
    required: true,
    description: 'Nombre completo del docente asignado.',
  })
  @IsNotEmpty({ message: 'La propiedad <teacherName> no debe estar vacía.' })
  teacherName: string;

  @ApiProperty({
    example: 'IS-101',
    required: true,
    description: 'Código resumido del curso.',
  })
  @IsNotEmpty({
    message: 'La propiedad <courseName> no debe estar vacía.',
  })
  courseName: string;

  @ApiProperty({
    example: 'IS101-2025',
    required: true,
    description: 'Código completo del curso.',
  })
  @IsNotEmpty({ message: 'La propiedad <courseCode> no debe estar vacía.' })
  courseCode: string;

  @ApiProperty({
    example: 'A1',
    required: true,
    description: 'Sección del curso.',
  })
  @IsNotEmpty({ message: 'La propiedad <section> no debe estar vacía.' })
  section: string;

  @ApiProperty({
    example: 4,
    required: true,
    description: 'Cantidad de Unidades Valorativas (UV).',
  })
  @IsNotEmpty({ message: 'La propiedad <uv> no debe estar vacía.' })
  uv: number;

  @ApiProperty({
    example: 'LuMaMiVi',
    required: true,
    description: 'Días en los que se imparte la clase.',
  })
  @IsNotEmpty({ message: 'La propiedad <days> no debe estar vacía.' })
  days: string;

  @ApiProperty({
    example: 35,
    required: true,
    description: 'Cantidad de estudiantes inscritos.',
  })
  @IsNotEmpty({ message: 'La propiedad <studentCount> no debe estar vacía.' })
  studentCount: number;

  @ApiProperty({
    example: 'Edificio C, Aula 302',
    required: true,
    description: 'Nombre o identificación del aula asignada.',
  })
  @IsNotEmpty({ message: 'La propiedad <classroomName> no debe estar vacía.' })
  classroomName: string;

  @ApiProperty({
    example: 'Ingeniería en Sistemas',
    required: true,
    description: 'Nombre del departamento académico.',
  })
  @IsNotEmpty({ message: 'La propiedad <departmentName> no debe estar vacía.' })
  departmentName: string;

  @ApiProperty({
    example: 'María López',
    required: true,
    description: 'Nombre del coordinador académico.',
  })
  @IsNotEmpty({ message: 'La propiedad <coordinator> no debe estar vacía.' })
  coordinator: string;

  @ApiProperty({
    example: 'Centro Universitario Regional del Litoral Atlántico',
    required: true,
    description: 'Nombre del centro universitario.',
  })
  @IsNotEmpty({ message: 'La propiedad <center> no debe estar vacía.' })
  center: string;

  @ApiProperty({
    example: 'Clase trasladada a otro horario por remodelación del aula.',
    required: false,
    nullable: true,
    description: 'Observaciones adicionales relacionadas a la asignación.',
  })
  @IsOptional()
  observation?: string | null;

  @ApiProperty({
    example: 'Clase trasladada a otro horario por remodelación del aula.',
    required: false,
    nullable: true,
    description: 'Observaciones adicionales relacionadas a la asignación.',
  })
  @IsNotEmpty()
  nearGraduation: boolean = false;
}

export type TAcademicAssignment = Record<number, keyof AcademicAssignmentDto>;
export class CreateAcademicAssignmentDto extends OmitType(
  AcademicAssignmentDto,
  ['id'] as const,
) {}

export class AcademicAssignmentArrayDto {
  @ApiProperty({
    type: () => CreateAcademicAssignmentDto,
    isArray: true,
    description: 'Lista de asignaciones académicas.',
  })
  @ValidateNested({ each: true })
  @Type(() => CreateAcademicAssignmentDto)
  assignments: CreateAcademicAssignmentDto[];
}

export const propertiesAcademicAssignment: TAcademicAssignment = {
  0: 'id',
  1: 'teacherCode',
  2: 'teacherName',
  3: 'courseCode',
  4: 'courseName',
  5: 'section',
  6: 'uv',
  7: 'days',
  8: 'studentCount',
  9: 'classroomName',
  10: 'departmentName',
  11: 'coordinator',
  12: 'center',
  13: 'observation',
};
