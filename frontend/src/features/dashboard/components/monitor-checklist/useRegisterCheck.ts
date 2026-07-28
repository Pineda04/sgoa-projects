import { useCallback, useState } from 'react';
import {
	TMonitorAssignmentCheckStatus,
	useCreateCheckMutation,
} from '@api/monitor';
import { getCurrentTimeString, getTodayDateString } from './checklist.utils';

interface RegisterCheckInput {
	courseClassroomId: string;
	isPresent: boolean;
	observation?: string;
}

export const useRegisterCheck = () => {
	const { createCheck, isPendingCreateCheck } = useCreateCheckMutation();
	const [submittingId, setSubmittingId] = useState<string | null>(null);
	const [checkOverrides, setCheckOverrides] = useState<
		Record<string, TMonitorAssignmentCheckStatus>
	>({});

	const registerCheck = useCallback(
		async ({ courseClassroomId, isPresent, observation }: RegisterCheckInput) => {
			setSubmittingId(courseClassroomId);

			try {
				const res = await createCheck({
					courseClassroomId,
					checkDate: getTodayDateString(),
					checkTime: getCurrentTimeString(),
					isPresent,
					observation: observation?.trim() || undefined,
				});

				const created = res.data.data;
				setCheckOverrides(prev => ({
					...prev,
					[courseClassroomId]: {
						id: created.id,
						isPresent: created.isPresent,
						checkTime: created.checkTime,
						observation: created.observation ?? null,
					},
				}));

				return true;
			} catch {
				// El error ya se notifica globalmente
				return false;
			} finally {
				setSubmittingId(null);
			}
		},
		[createCheck]
	);

	return {
		registerCheck,
		checkOverrides,
		submittingId,
		isRegistering: isPendingCreateCheck,
	};
};
