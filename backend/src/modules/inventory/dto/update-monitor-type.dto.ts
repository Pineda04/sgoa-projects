import { PartialType } from '@nestjs/mapped-types';
import { CreateMonitorTypeDto } from './create-monitor-type.dto';

export class UpdateMonitorTypeDto extends PartialType(CreateMonitorTypeDto) {}
