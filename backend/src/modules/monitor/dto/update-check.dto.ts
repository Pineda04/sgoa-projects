import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsString, ValidateIf } from 'class-validator';

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
}
