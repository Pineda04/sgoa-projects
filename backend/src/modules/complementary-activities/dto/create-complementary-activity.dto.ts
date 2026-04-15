import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsString,
  IsNotEmpty,
  IsUUID,
  Length,
  ValidateIf,
  IsEnum,
  IsDefined,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ValidatorConstraintDecorator } from 'src/common/decorators';
import { ETeachingAssignmentConfig } from 'src/modules/teaching-assignment/enums';
import { IsValidIdsTeachingAssignmentConfigConstraint } from 'src/modules/teaching-assignment/validators';
import { EActivityType, EPogressLevel } from '../enums';
import { CreateVerificationMediaDto } from './create-verification-media.dto';
import { PickType } from '@nestjs/mapped-types';

export class CreateComplementaryActivityDto extends PickType(
  CreateVerificationMediaDto,
  ['description'] as const,
) {
  @ApiProperty({
    name: 'activityType',
    enum: EActivityType,
    // enumName: 'EActivityType',
    description: 'Tipo de actividad.',
    example: EActivityType.Research,
  })
  @IsString({
    message: 'La propiead <activityType> debe se una cadena de texto.',
  })
  @IsEnum(EActivityType, {
    message: `El tipo de actividad debe ser uno de los siguientes: ${Object.values(EActivityType).join(', ')}.`,
  })
  activityType: EActivityType;
  // Investigacion y vinculacion son obligatios, los registros y si lleva el el registro, el fileNumber

  @ApiProperty({
    description: 'Nombre de la actividad.',
  })
  @IsString({
    message: 'La propiedad <name> debe ser una cadena de texto.',
  })
  @IsNotEmpty({ message: 'La propiedad <name> no debe estar vacía.' })
  @Length(3, 250, {
    message: 'La propiedad <name> debe tener entre 3 y 250 caracteres.',
  })
  name: string;

  @ApiProperty({
    description: `¿La actividad está registrada? Campo obligatorio solo si el tipo de actividad es uno de los siguientes tipos de actividad: ${[EActivityType.Research, EActivityType.Outreach].join(', ')}; en caso contrario es opcional.`,
    type: 'boolean',
    example: false,
    required: false,
    nullable: true,
  })
  @ValidateIf((ca: CreateComplementaryActivityDto) =>
    [EActivityType.Research, EActivityType.Outreach].includes(ca.activityType),
  )
  @IsNotEmpty({
    message: `Si marcó uno de los siguientes tipos de actividad: ${[EActivityType.Research, EActivityType.Outreach].join(', ')}; debe indicar si está registrada o no.`,
  })
  @IsDefined({
    message: `Si marcó uno de los siguientes tipos de actividad: ${[
      EActivityType.Research,
      EActivityType.Outreach,
    ].join(', ')}; debe indicar si está registrada o no.`,
  })
  @IsBoolean({
    message: 'La propiedad <isRegistered> debe se un valor booleano.',
  })
  @Transform(
    ({
      obj,
      value,
    }: {
      obj: CreateComplementaryActivityDto;
      value: boolean;
    }) =>
      [EActivityType.Research, EActivityType.Outreach].includes(
        obj.activityType,
      )
        ? value
        : null,
  )
  @Transform(({ value }) => {
    if (value === null || value === undefined) return value;
    if (typeof value === 'boolean') return value;
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  isRegistered: boolean;

  @ValidateIf((ca: CreateComplementaryActivityDto) =>
    [EActivityType.Research, EActivityType.Outreach].includes(ca.activityType),
  )
  @ApiProperty({
    description:
      'Número de expediente. Es opcional, pero obligatorio si se marca que está registrada la actividad.',
    type: 'string',
    required: false,
    nullable: true,
  })
  @ValidateIf((ca: CreateComplementaryActivityDto) => !!ca.isRegistered)
  @IsString({
    message: 'La propiedad <fileNumber> debe ser una cadena de texto.',
  })
  // @IsOptional()
  @IsNotEmpty({
    message:
      'Si marco que la actividad está registrada debe ingresar el número de expediente <fileNumber>.',
  })
  @Transform(
    ({
      obj,
      value,
    }: {
      obj: CreateComplementaryActivityDto;
      value: boolean;
    }) =>
      [EActivityType.Research, EActivityType.Outreach].includes(
        obj.activityType,
      )
        ? value
        : null,
  )
  @Transform(({ value }) =>
    value === 'undefined' || value === '' ? null : (value as string),
  )
  fileNumber: string;

  @ApiProperty({
    name: 'progressLevel',
    enum: EPogressLevel,
    description: 'Nivel de avance de la actividad.',
    example: EPogressLevel.PROPOSAL,
  })
  @IsString({
    message: 'La propiedad <progressLevel> debe ser una cadena de texto.',
  })
  @IsNotEmpty({ message: 'La propiedad <progressLevel> no debe estar vacía.' })
  @IsEnum(EPogressLevel, {
    message: `El nivel de avance debe ser uno de los siguientes: ${Object.values(EPogressLevel).join(', ')}.`,
  })
  progressLevel: EPogressLevel;

  @ApiProperty({
    description: 'ID de la asignación académica a la que pertenece.',
  })
  @IsUUID('all', {
    each: true,
    message: 'La propiedad <assignmentReportId> debe ser un UUID válido.',
  })
  @IsNotEmpty({
    message: 'La propiedad <assignmentReportId> no debe estar vacía.',
  })
  @ValidatorConstraintDecorator(
    ETeachingAssignmentConfig.ASSIGNMENT,
    IsValidIdsTeachingAssignmentConfigConstraint,
  )
  assignmentReportId: string;

  @ApiProperty({
    description: 'Descripción del medio de verificación.',
    example: 'Foto de la actividad...',
    type: 'string',
  })
  @IsString({
    message: 'La propiedad <descripción> debe ser una cadena de texto.',
  })
  @IsNotEmpty({ message: 'La propiedad <descripción> no debe estar vacía.' })
  @Length(3, 250, {
    message: 'La propiedad <descripción> debe tener entre 3 y 250 caracteres.',
  })
  description: string;

  @ApiProperty({
    description: 'Archivos a adjuntar, opcional y múltiples (solamente 5).',
    type: 'array',
    items: { type: 'string', format: 'binary' },
    maxItems: 5,
    required: false,
    nullable: true,
  })
  files: Express.Multer.File[];
}
