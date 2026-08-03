import { useCallback, useState } from 'react';
import {
	TMonitorAssignmentCheckStatus,
	useCreateCheckMutation,
	useUpdateCheckMutation,
} from '@api/monitor';
import { getCurrentTimeString, getTodayDateString } from './checklist.utils';

interface RegisterCheckInput {
	courseClassroomId: string;
	isPresent: boolean;
	observation?: string;
}

interface EditCheckInput {
	checkId: string;
	courseClassroomId: string;
	isPresent: boolean;
	observation?: string;
}

export const useRegisterCheck = () => {
	const { createCheck, isPendingCreateCheck } = useCreateCheckMutation();
	const { updateCheck, isPendingUpdateCheck } = useUpdateCheckMutation();
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
						monitorId: created.monitorId,
						isPresent: created.isPresent,
						checkTime: created.checkTime,
						observation: created.observation ?? null,
						createdAt: created.createdAt,
						updatedAt: created.updatedAt,
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

	const editCheck = useCallback(
		async ({
			checkId,
			courseClassroomId,
			isPresent,
			observation,
		}: EditCheckInput) => {
			setSubmittingId(courseClassroomId);

			try {
				const res = await updateCheck({
					id: checkId,
					isPresent,
					observation: observation?.trim() ?? '',
				});

				const updated = res.data.data;
				setCheckOverrides(prev => ({
					...prev,
					[courseClassroomId]: {
						id: updated.id,
						monitorId: updated.monitorId,
						isPresent: updated.isPresent,
						checkTime: updated.checkTime,
						observation: updated.observation ?? null,
						createdAt: updated.createdAt,
						updatedAt: updated.updatedAt,
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
		[updateCheck]
	);

	return {
		registerCheck,
		editCheck,
		checkOverrides,
		submittingId,
		isRegistering: isPendingCreateCheck || isPendingUpdateCheck,
	};
};
