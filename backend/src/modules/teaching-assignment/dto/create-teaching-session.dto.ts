import { IsDateString, IsOptional, IsUUID, IsNotEmpty } from 'class-validator';
import { ValidatorConstraintDecorator } from 'src/common/decorators';
import { ETeachingAssignmentConfig } from '../enums';
import { IsValidIdsTeachingAssignmentConfigConstraint } from '../validators';
import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';

export class CreateTeachingSessionDto {
  @ApiPropertyOptional({
    description: 'Hora de consulta (fecha y hora).',
    example: '2025-08-09T14:30:00Z',
  })
  @IsDateString(
    {},
    { message: 'La propiedad <consultHour> debe ser una fecha válida.' },
  )
  @IsOptional()
  consultHour?: string;

  @ApiPropertyOptional({
    description: 'Hora de tutoría (fecha y hora).',
    example: '2025-08-09T16:00:00Z',
  })
  @IsDateString(
    {},
    { message: 'La propiedad <tutoringHour> debe ser una fecha válida.' },
  )
  @IsOptional()
  tutoringHour?: string;

  @ApiProperty({
    description: 'ID del reporte de asignación.',
    example: '65039ef6-1fc5-474c-b4e3-27239c200138',
    required: true,
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
}
