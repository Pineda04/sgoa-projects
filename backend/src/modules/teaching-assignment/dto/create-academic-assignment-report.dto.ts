import { IsUUID, IsNotEmpty, Validate } from 'class-validator';
import { ValidatorConstraintDecorator } from 'src/common/decorators';
import { IsValidUserIdConstraint } from 'src/modules/teachers/validators';
import { ETeachingAssignmentConfig } from '../enums';
import { IsValidIdsTeachingAssignmentConfigConstraint } from '../validators';
import { ApiProperty } from '@nestjs/swagger';
import { IsValidCenterConfigConstraint } from 'src/modules/centers/validators';
import { ECenterConfig } from 'src/modules/centers/enums';

export class CreateAcademicAssignmentReportDto {
  @ApiProperty({
    example: '65039ef6-1fc5-474c-b4e3-27239c200138',
    description: 'ID del usuario.',
    required: true,
  })
  @IsUUID('all', {
    each: true,
    message: 'La propiedad <userId> debe ser un UUID válido.',
  })
  @IsNotEmpty({
    message: 'La propiedad <userId> no debe estar vacía.',
  })
  @Validate(IsValidUserIdConstraint)
  userId: string;

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

  // @ApiProperty({
  //   example: '65039ef6-1fc5-474c-b4e3-27239c200138',
  //   description: 'ID del departamento.',
  //   required: true,
  // })
  // @IsUUID('all', {
  //   each: true,
  //   message: 'La propiedad <departmentId> debe ser un UUID válido.',
  // })
  // @IsNotEmpty({ message: 'La propiedad <departmentId> no debe estar vacía.' })
  // @Validate(IsValidDepartmentIdConstraint)
  // departmentId: string;

  @ApiProperty({
    example: '65039ef6-1fc5-474c-b4e3-27239c200138',
    description: 'ID del periodo académico.',
    required: true,
  })
  @IsUUID('all', {
    each: true,
    message: 'La propiedad <periodId> debe ser un UUID válido.',
  })
  @IsNotEmpty({ message: 'La propiedad <periodId> no debe estar vacía.' })
  @ValidatorConstraintDecorator(
    ETeachingAssignmentConfig.PERIOD,
    IsValidIdsTeachingAssignmentConfigConstraint,
  )
  periodId: string;
}
