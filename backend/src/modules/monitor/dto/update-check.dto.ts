import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateCheckDto {
  @ApiPropertyOptional({
    description: 'Indica si el docente se encontraba presente en el aula',
  })
  @IsOptional()
  @IsBoolean()
  isPresent?: boolean;

  @ApiPropertyOptional({
    description: 'Observación adicional registrada por el monitor',
  })
  @IsOptional()
  @IsString()
  observation?: string;
}
