import { SetMetadata } from '@nestjs/common';
import { TPermissionAction, TPermissionSubject } from '../constants';

export const PERMISSION_KEY = 'permission';

export const RequirePermission = (
  action: TPermissionAction,
  subject: TPermissionSubject,
) => SetMetadata(PERMISSION_KEY, { action, subject });
