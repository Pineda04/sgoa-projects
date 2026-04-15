import { SetMetadata } from '@nestjs/common';
import { EUserRole } from '../enums';

export const Roles = (...roles: EUserRole[]) => SetMetadata('roles', roles);
