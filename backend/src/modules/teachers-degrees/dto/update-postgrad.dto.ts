import { PartialType } from '@nestjs/mapped-types';
import { CreatePostgradDto } from './create-postgrad.dto';

export class UpdatePostgradDto extends PartialType(CreatePostgradDto) {}
