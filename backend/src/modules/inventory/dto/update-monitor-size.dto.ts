import { PartialType } from '@nestjs/mapped-types';
import { CreateMonitorSizeDto } from './create-monitor-size.dto';

export class UpdateMonitorSizeDto extends PartialType(CreateMonitorSizeDto) {}
