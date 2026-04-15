import { PartialType } from '@nestjs/mapped-types';
import { CreateConnectivityDto } from './create-connectivity.dto';

export class UpdateConnectivityDto extends PartialType(CreateConnectivityDto) {}
