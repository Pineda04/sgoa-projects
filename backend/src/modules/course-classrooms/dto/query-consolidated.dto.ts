import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsNumberString, IsOptional } from 'class-validator';
import { ValidatorConstraintDecorator } from 'src/common/decorators';
import { ETeachingAssignmentConfig } from 'src/modules/teaching-assignment/enums';
import { IsValidIdsTeachingAssignmentConfigConstraint } from 'src/modules/teaching-assignment/validators';
import { ECourseClassroomConfig } from '../enums';
import { IsValidClassroomConfigConstraint } from '../validators';
import { ECenterConfig } from 'src/modules/centers/enums';
import { IsValidCenterConfigConstraint } from 'src/modules/centers/validators';

export class QueryConsolidatedDto {
  @ApiProperty({
    example: '2025',
    description: 'Año.',
    required: false,
  })
  @IsOptional()
  @IsNumberString(
    {},
    {
      message: 'El valor de <year> debe ser un número.',
    },
  )
  year?: string;

  @ApiProperty({
    example: '1',
    description: 'Número de PAC.',
    required: false,
  })
  @IsOptional()
  @IsNumberString(
    {},
    {
      message: 'El valor de <pac> debe ser un número.',
    },
  )
  pac?: string;

  @ApiProperty({
    example: '65039ef6-1fc5-474c-b4e3-27239c200138',
    description: 'ID del periodo académico.',
    required: false,
  })
  @IsUUID('all', {
    each: true,
    message: 'La propiedad <periodId> debe ser un UUID válido.',
  })
  @IsOptional()
  @ValidatorConstraintDecorator(
    ETeachingAssignmentConfig.PERIOD,
    IsValidIdsTeachingAssignmentConfigConstraint,
  )
  periodId?: string;

  @ApiProperty({
    example: '65039ef6-1fc5-474c-b4e3-27239c200138',
    description: 'ID de la relación centro-departamento.',
    required: false,
  })
  @IsUUID('all', {
    message: 'La propiedad <centerDepartmentId> debe ser un UUID válido.',
  })
  @IsOptional()
  @ValidatorConstraintDecorator(
    ECenterConfig.CENTER_DEPARTMENT,
    IsValidCenterConfigConstraint,
  )
  centerDepartmentId?: string;

  @ApiProperty({
    description: 'UUID del curso.',
    example: 'a1b2c3d4-e5f6-7890-abcd-1234567890ab',
    required: false,
  })
  @IsUUID('all', {
    each: true,
    message: 'La propiedad <courseId> debe ser un UUID válido.',
  })
  @IsOptional()
  @ValidatorConstraintDecorator(
    ECourseClassroomConfig.COURSE,
    IsValidClassroomConfigConstraint,
  )
  courseId?: string;
}
