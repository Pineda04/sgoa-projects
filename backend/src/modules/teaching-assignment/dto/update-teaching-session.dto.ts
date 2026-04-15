import { PartialType } from '@nestjs/swagger';
import { CreateTeachingSessionDto } from './create-teaching-session.dto';

export class UpdateTeachingSessionDto extends PartialType(
  CreateTeachingSessionDto,
) {}
