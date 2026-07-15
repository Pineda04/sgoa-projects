import {
  PERMISSION_ACTIONS,
  PERMISSION_SUBJECTS,
} from '../../src/common/constants';

export const permissionsSeed = PERMISSION_ACTIONS.flatMap((action) =>
  PERMISSION_SUBJECTS.map((subject) => ({ action, subject })),
);
