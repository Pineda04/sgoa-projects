import type { TComplementaryActivity } from '@features/teachers/types/activity.types';
import type { EActivityType } from '@features/teachers/constants';

export const handleActivities = (
  allActivities: TComplementaryActivity[] | undefined,
  filter: EActivityType,
): TComplementaryActivity[] | [] =>
  allActivities
    ? allActivities.filter((ca) => ca.activityType.name === filter)
    : [];
