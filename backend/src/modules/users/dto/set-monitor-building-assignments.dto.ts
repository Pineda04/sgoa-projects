import { ApiProperty } from '@nestjs/swagger';
import { ArrayUnique, IsArray, IsUUID } from 'class-validator';

export class SetMonitorBuildingAssignmentsDto {
  @ApiProperty({
    description: 'Lista completa de edificios asignados al monitor.',
    type: [String],
    format: 'uuid',
  })
  @IsArray()
  @ArrayUnique()
  @IsUUID('4', { each: true })
  buildingIds: string[];
}
