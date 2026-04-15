import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsNotEmpty, Validate } from 'class-validator';
import { ValidatorConstraintDecorator } from 'src/common/decorators';
import { ECenterConfig } from '../enums';
import {
  IsValidCenterConfigConstraint,
  IsValidDepartmentIdConstraint,
} from '../validators';

export class CreateCenterDepartmentDto {
  @ApiProperty({
    example: '484b0088-09ac-467b-981a-a0885deb69cb',
    required: true,
    description: 'ID del centro.',
  })
  @IsUUID('all', {
    message: 'La propiedad <centerId> debe ser un UUID válido.',
  })
  @IsNotEmpty({ message: 'La propiedad <centerId> no debe estar vacía.' })
  @ValidatorConstraintDecorator(
    ECenterConfig.CENTER,
    IsValidCenterConfigConstraint,
  )
  centerId: string;

  @ApiProperty({
    example: '484b0088-09ac-467b-981a-a0885deb69cb',
    required: true,
    description: 'ID del departamento.',
  })
  @IsUUID('all', {
    each: true,
    message: 'La propiedad <departmentId> debe ser un UUID válido.',
  })
  @IsNotEmpty({ message: 'La propiedad <departmentId> no debe estar vacía.' })
  @Validate(IsValidDepartmentIdConstraint)
  departmentId: string;
}
