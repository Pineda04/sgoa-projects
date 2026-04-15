import {
  IsNotEmpty,
  IsString,
  IsInt,
  IsBoolean,
  IsUUID,
  Length,
  IsOptional,
} from 'class-validator';
import { ValidatorConstraintDecorator } from 'src/common/decorators';
import { EInventoryConfig } from 'src/modules/inventory/enums';
import { IsValidIdsInventoryConfigConstraint } from 'src/modules/inventory/validators';
import { ETeachingAssignmentConfig } from 'src/modules/teaching-assignment/enums';
import { IsValidIdsTeachingAssignmentConfigConstraint } from 'src/modules/teaching-assignment/validators';
import { ECourseClassroomConfig } from '../enums';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsValidClassroomConfigConstraint } from '../validators';

export class CreateCourseClassroomDto {
  @ApiProperty({
    description: 'UUID del curso.',
    example: 'a1b2c3d4-e5f6-7890-abcd-1234567890ab',
    required: true,
  })
  @IsUUID('all', {
    each: true,
    message: 'La propiedad <courseId> debe ser un UUID válido.',
  })
  @IsNotEmpty({ message: 'La propiedad <courseId> no debe estar vacía.' })
  @ValidatorConstraintDecorator(
    ECourseClassroomConfig.COURSE,
    IsValidClassroomConfigConstraint,
  )
  courseId: string;

  @ApiProperty({
    description: 'UUID del aula.',
    example: 'b2c3d4e5-f6a1-7890-abcd-1234567890ab',
    required: true,
  })
  @IsUUID('all', {
    each: true,
    message: 'La propiedad <classroomId> debe ser un UUID válido.',
  })
  @IsNotEmpty({ message: 'La propiedad <classroomId> no debe estar vacía.' })
  @ValidatorConstraintDecorator(
    EInventoryConfig.CLASSROOM,
    IsValidIdsInventoryConfigConstraint,
  )
  classroomId: string;

  @ApiProperty({
    description: 'UUID de la sesión de enseñanza.',
    example: 'c3d4e5f6-a1b2-7890-abcd-1234567890ab',
    required: true,
  })
  @IsUUID('all', {
    each: true,
    message: 'La propiedad <teachingSessionId> debe ser un UUID válido.',
  })
  @IsNotEmpty({
    message: 'La propiedad <teachingSessionId> no debe estar vacía.',
  })
  @ValidatorConstraintDecorator(
    ETeachingAssignmentConfig.SESSION,
    IsValidIdsTeachingAssignmentConfigConstraint,
  )
  teachingSessionId: string;

  @ApiProperty({
    description: 'Nombre de la sección.',
    example: 'A',
    required: true,
  })
  @IsString({
    message: 'La propiedad <section> debe ser una cadena de texto.',
  })
  @IsNotEmpty({ message: 'La propiedad <section> no debe estar vacía.' })
  @Length(3, 50, {
    message: 'La propiedad <section> debe tener entre 3 y 50 caracteres.',
  })
  section: string;

  @ApiProperty({
    description:
      'Días de clase, puede ser un número o abreviaturas, ej: 3 o LuMaMi, 4 o LuMaMiJu.',
    example: 'LuMaMi',
    required: true,
  })
  @IsString({
    message:
      'La propiedad <days> debe ser una cadena de texto, por ejemplo: 3 o LuMaMi, 4 o LuMaMiJu.',
  })
  @IsNotEmpty({ message: 'La propiedad <days> no debe estar vacía.' })
  @Length(1, 20, {
    message: 'La propiedad <days> debe tener entre 1 y 20 caracteres.',
  })
  days: string;

  @ApiProperty({
    description: 'Cantidad de estudiantes inscritos.',
    example: 30,
    required: true,
  })
  @IsInt({ message: 'La propiedad <studentCount> debe ser un número entero.' })
  @IsNotEmpty({ message: 'La propiedad <studentCount> no debe estar vacía.' })
  studentCount: number;

  @ApiProperty({
    description: 'UUID de la modalidad.',
    example: 'd4e5f6a1-b2c3-7890-abcd-1234567890ab',
    required: true,
  })
  @IsUUID('all', {
    each: true,
    message: 'La propiedad <modalityId> debe ser un UUID válido.',
  })
  @IsNotEmpty({ message: 'La propiedad <modalityId> no debe estar vacía.' })
  @ValidatorConstraintDecorator(
    ECourseClassroomConfig.MODALITY,
    IsValidClassroomConfigConstraint,
  )
  modalityId: string;

  @ApiProperty({
    description: 'Indica si está cerca de graduación.',
    example: false,
    required: true,
  })
  @IsBoolean({
    message: 'La propiedad <nearGraduation> debe ser un valor booleano.',
  })
  @IsNotEmpty({ message: 'La propiedad <nearGraduation> no debe estar vacía.' })
  nearGraduation: boolean = false;

  @ApiProperty({
    description: 'Código del grupo.',
    example: 'G1',
    required: true,
  })
  @IsString({
    message:
      'La propiedad <groupCode> debe ser una cadena de texto, por ejemplo: G1, G2, etc.',
  })
  @IsNotEmpty({ message: 'La propiedad <groupCode> no debe estar vacía.' })
  @Length(2, 50, {
    message: 'La propiedad <groupCode> debe tener entre 2 y 50 caracteres.',
  })
  groupCode: string; // ya está por defecto en la base de datos

  @ApiPropertyOptional({
    description: 'Observaciones adicionales.',
    example: 'Sección con necesidades especiales.',
  })
  @IsString({
    message: 'La propiedad <observation> debe ser una cadena de texto.',
  })
  @IsOptional()
  @Length(0, 500, {
    message: 'La propiedad <observation> debe tener hasta 500 caracteres.',
  })
  observation?: string;
}
