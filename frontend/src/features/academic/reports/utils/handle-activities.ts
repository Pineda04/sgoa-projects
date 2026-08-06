import { TComplementaryActivity } from '@api/activities';
import { EActivityType } from '@shared/constants';

export const handleActivities = (
	allActivities: TComplementaryActivity[] | undefined,
	filter: EActivityType
): TComplementaryActivity[] | [] =>
	allActivities
		? allActivities.filter(ca => ca.activityType.name === filter)
		: [];
