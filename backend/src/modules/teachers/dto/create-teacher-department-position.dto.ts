import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsDateString,
  IsOptional,
  Validate,
  IsUUID,
} from 'class-validator';
import { formatISO } from 'date-fns';
import { ValidatorConstraintDecorator } from 'src/common/decorators';
import { ECenterConfig } from 'src/modules/centers/enums';
import { IsValidCenterConfigConstraint } from 'src/modules/centers/validators';
import { IsValidPositionIdConstraint } from 'src/modules/teachers-config/validators';
import { IsValidUserIdConstraint } from 'src/modules/teachers/validators';

export class CreateTeacherDepartmentPositionDto {
  @ApiProperty({
    example: 'eec45228-d3ed-4f0a-bd56-d44a7d2818e8',
    required: true,
    description: 'ID del usuario docente.',
  })
  @IsUUID('all', {
    each: true,
    message: 'La propiedad <userId> debe ser un UUID válido.',
  })
  @IsNotEmpty({ message: 'La propiedad <userId> no debe estar vacía.' })
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
  //   example: '484b0088-09ac-467b-981a-a0885deb69cb',
  //   required: true,
  //   description: 'ID del centro.',
  // })
  // @IsUUID('all', {
  //   message: 'La propiedad <centerId> debe ser un UUID válido.',
  // })
  // @IsNotEmpty({ message: 'La propiedad <centerId> no debe estar vacía.' })
  // @ValidatorConstraintDecorator(
  //   ECenterConfig.CENTER,
  //   IsValidCenterConfigConstraint,
  // )
  // centerId: string;

  // @ApiProperty({
  //   example: '484b0088-09ac-467b-981a-a0885deb69cb',
  //   required: true,
  //   description: 'ID del departamento.',
  // })
  // @IsUUID('all', {
  //   each: true,
  //   message: 'La propiedad <departmentId> debe ser un UUID válido.',
  // })
  // @IsNotEmpty({ message: 'La propiedad <departmentId> no debe estar vacía.' })
  // @Validate(IsValidDepartmentIdConstraint)
  // departmentId: string;

  @ApiProperty({
    example: 'uuid-position',
    required: true,
    description: 'ID del cargo.',
  })
  @IsString({
    message: 'La propiedad <positionId> debe ser una cadena de texto.',
  })
  @IsNotEmpty({ message: 'La propiedad <positionId> no debe estar vacía.' })
  @Validate(IsValidPositionIdConstraint)
  positionId: string;

  @ApiProperty({
    example: '2025-08-09',
    required: false,
    description: 'Fecha de inicio.',
  })
  @IsOptional()
  @IsDateString(
    {},
    {
      message:
        'La propiedad <startDate> debe ser una fecha válida, <yyyy-MM-dd>.',
    },
  )
  startDate: string = formatISO(new Date().toISOString());

  @ApiProperty({
    example: '2025-12-31',
    required: false,
    description: 'Fecha de fin.',
  })
  @IsDateString(
    {},
    {
      message:
        'La propiedad <endDate> debe ser una fecha válida, <yyyy-MM-dd>.',
    },
  )
  @IsOptional()
  endDate?: string;
}
