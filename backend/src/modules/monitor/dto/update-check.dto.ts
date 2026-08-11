import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsString, ValidateIf } from 'class-validator';
import { DigitalBlackboardUseStatus } from 'src/generated/prisma/client';

export class UpdateCheckDto {
  @ApiPropertyOptional({
    description: 'Indica si el docente se encontraba presente en el aula',
  })
  @ValidateIf((_, value) => value !== undefined)
  @IsBoolean()
  isPresent?: boolean;

  @ApiPropertyOptional({
    description: 'Observación adicional registrada por el monitor',
  })
  @ValidateIf((_, value) => value !== undefined)
  @IsString()
  observation?: string;

  @ApiPropertyOptional({
    description: 'Uso observado de la pizarra digital durante el chequeo.',
    enum: DigitalBlackboardUseStatus,
  })
  @ValidateIf((_, value) => value !== undefined)
  @IsEnum(DigitalBlackboardUseStatus)
  digitalBlackboardUseStatus?: DigitalBlackboardUseStatus;
}
