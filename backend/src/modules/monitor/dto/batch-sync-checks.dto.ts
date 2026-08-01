import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';
import { CreateCheckDto } from './create-check.dto';

export class BatchSyncChecksDto {
  @ApiProperty({
    type: [CreateCheckDto],
    description:
      'Lista de verificaciones registradas localmente sin conexión a internet.',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateCheckDto)
  checks: CreateCheckDto[];
}
