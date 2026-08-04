import { PickType } from '@nestjs/swagger';
import { UpdateUserDto } from './update-user.dto';

export class UpdateMyUserDto extends PickType(UpdateUserDto, [
  'name',
  'email',
  'password',
  'passwordConfirm',
] as const) {}
