import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsISO8601,
  IsEnum,
  MaxLength,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
} from 'class-validator';
import { DigitalBlackboardUseStatus } from 'src/generated/prisma/client';

export class CreateCheckDto {
  @ApiProperty({
    description: 'ID de la sección de asignatura (CourseClassroom) verificada',
    format: 'uuid',
  })
  @IsUUID()
  courseClassroomId: string;

  @ApiProperty({
    description: 'Fecha en la que se realizó la verificación',
    example: '2026-07-18',
  })
  @IsISO8601()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'La propiedad <checkDate> debe tener el formato YYYY-MM-DD.',
  })
  checkDate: string;

  @ApiProperty({
    description: 'Hora en la que se realizó la verificación, formato HH:MM',
    example: '10:30',
  })
  @Matches(/^(?:[01]\d|2[0-3]):[0-5]\d$/, {
    message: 'La propiedad <checkTime> debe tener el formato HH:MM.',
  })
  checkTime: string;

  @ApiProperty({
    description: 'Indica si el docente se encontraba presente en el aula',
  })
  @IsBoolean()
  isPresent: boolean;

  @ApiPropertyOptional({
    description: 'Observación adicional registrada por el monitor',
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  observation?: string;

  @ApiPropertyOptional({
    description: 'Uso observado de la pizarra digital durante el chequeo.',
    enum: DigitalBlackboardUseStatus,
  })
  @IsOptional()
  @IsEnum(DigitalBlackboardUseStatus)
  digitalBlackboardUseStatus?: DigitalBlackboardUseStatus;

  @ApiPropertyOptional({
    description:
      'ID generado por el cliente cuando la verificación se registró sin conexión',
  })
  @IsOptional()
  @IsUUID()
  offlineId?: string;
}
