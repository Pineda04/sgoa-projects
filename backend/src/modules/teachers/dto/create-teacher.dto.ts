import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsMilitaryTime,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  Validate,
  ValidateIf,
} from 'class-validator';
import { EConfigType, EDegreeType } from '../enums';
import {
  IsValidConfigTeacherConstraint,
  IsValidGradDegreeConstraint,
  IsValidUserIdConstraint,
  IsValidWorkinDayConstraint,
} from '../validators';
import { ValidatorConstraintDecorator } from 'src/common/decorators';
import { IsValidPositionIdConstraint } from 'src/modules/teachers-config/validators';
import { IsValidCenterConfigConstraint } from 'src/modules/centers/validators';
import { ECenterConfig } from 'src/modules/centers/enums';

export class CreateTeacherDto {
  @ApiProperty({
    description: 'UUID del pregrado.',
    example: 'a1b2c3d4-e5f6-7890-abcd-1234567890ab',
    required: true,
  })
  @IsUUID('all', {
    each: true,
    message: 'La propiedad <undergradId> debe ser un UUID válido.',
  })
  @ValidatorConstraintDecorator(
    EDegreeType.UNDERGRAD,
    IsValidGradDegreeConstraint,
  )
  undergradId: string;

  @ApiPropertyOptional({
    description: 'UUID del posgrado.',
    example: 'b2c3d4e5-f6a1-7890-abcd-1234567890ab',
  })
  @IsOptional()
  @IsUUID('all', {
    each: true,
    message: 'La propiedad <postgradId> debe ser un UUID válido.',
  })
  @ValidatorConstraintDecorator(
    EDegreeType.POSTGRAD,
    IsValidGradDegreeConstraint,
  )
  postgradId?: string;

  @ApiProperty({
    description: 'UUID de la categoría.',
    example: 'c3d4e5f6-a1b2-7890-abcd-1234567890ab',
    required: true,
  })
  @IsUUID('all', {
    each: true,
    message: 'La propiedad <categoryId> debe ser un UUID válido.',
  })
  @IsNotEmpty({
    message: 'La propiedad <categoryId> no debe estar vacía.',
  })
  @ValidatorConstraintDecorator(
    EConfigType.CATEGORY,
    IsValidConfigTeacherConstraint,
  )
  categoryId: string;

  @ApiProperty({
    description: 'UUID del tipo de contrato.',
    example: 'd4e5f6a1-b2c3-7890-abcd-1234567890ab',
    required: true,
  })
  @IsUUID('all', {
    each: true,
    message: 'La propiedad <contractTypeId> debe ser un UUID válido.',
  })
  @IsNotEmpty({
    message: 'La propiedad <contractTypeId> no debe estar vacía.',
  })
  @ValidatorConstraintDecorator(
    EConfigType.CONTRACT,
    IsValidConfigTeacherConstraint,
  )
  contractTypeId: string;

  @ApiProperty({
    description: 'UUID del turno.',
    example: 'e5f6a1b2-c3d4-7890-abcd-1234567890ab',
    required: true,
  })
  @IsUUID('all', {
    each: true,
    message: 'La propiedad <shiftId> debe ser un UUID válido versión.',
  })
  @IsNotEmpty({
    message: 'La propiedad <shiftId> no debe estar vacía.',
  })
  @ValidatorConstraintDecorator(
    EConfigType.SHIFT,
    IsValidConfigTeacherConstraint,
  )
  shiftId: string;

  @ApiProperty({
    description: 'UUID del usuario.',
    example: 'f6a1b2c3-d4e5-7890-abcd-1234567890ab',
    required: true,
  })
  @ValidateIf((o: CreateTeacherDto) => !o.currentUserId)
  @IsUUID('all', {
    each: true,
    message: 'La propiedad <userId> debe ser un UUID válido.',
  })
  @Validate(IsValidUserIdConstraint)
  userId: string;

  // @ApiPropertyOptional({
  //   description: 'UUID del usuario actual.',
  //   example: 'a1b2c3d4-e5f6-7890-abcd-1234567890ab',
  // })
  @IsOptional()
  @IsUUID('all', {
    each: true,
    message: 'La propiedad <currentUserId> debe ser un UUID válido.',
  })
  @Validate(IsValidUserIdConstraint)
  currentUserId?: string;

  // @IsOptional()
  // @IsUUID()
  // @ValidatorConstraintDecorator(
  //   ECenterConfig.CENTER,
  //   IsValidCenterConfigConstraint,
  // )
  // centerId: string;
  //
  // @IsOptional()
  // @IsUUID()
  // @Validate(IsValidDepartmentIdConstraint)
  // departmentId: string;

  @ApiProperty({
    example: '65039ef6-1fc5-474c-b4e3-27239c200138',
    description: 'ID de la relación centro-departamento.',
    required: true,
  })
  @IsUUID('all', {
    message: 'La propiedad <centerDepartmentId> debe ser un UUID válido.',
  })
  @IsNotEmpty({
    message: 'La propiedad <centerDepartmentId> no debe estar vacía.',
  })
  @ValidatorConstraintDecorator(
    ECenterConfig.CENTER_DEPARTMENT,
    IsValidCenterConfigConstraint,
  )
  centerDepartmentId: string;

  @IsOptional()
  @IsUUID()
  @Validate(IsValidPositionIdConstraint)
  positionId: string;

  @ApiProperty({
    description: 'Hora de inicio de jornada (en formato de 24 horas).',
    example: '11:00',
    required: false,
  })
  @IsMilitaryTime({
    message: 'La propiedad <shiftStart> debe ser una hora válida.',
  })
  @IsOptional()
  @Validate(IsValidWorkinDayConstraint)
  shiftStart?: string;

  // @ValidateIf((o: CreateTeacherDto) => o.shiftStart !== undefined)
  @ApiProperty({
    description: 'Hora de finalización jornada (en formato de 24 horas).',
    example: '17:00',
    required: false,
  })
  @IsMilitaryTime({
    message: 'La propiedad <shiftEnd> debe ser una hora válida.',
  })
  @IsOptional()
  @Validate(IsValidWorkinDayConstraint)
  shiftEnd?: string;
}
