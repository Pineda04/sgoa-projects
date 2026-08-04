import { useCallback, useState } from 'react';
import { isAxiosError } from 'axios';
import {
	DigitalBlackboardUseStatus,
	TMonitorAssignmentCheckStatus,
	useCreateCheckMutation,
} from '@api/monitor';
import { getCurrentTimeString, getTodayDateString } from './checklist.utils';
import { useOfflineCheckSync } from './useOfflineCheckSync';

interface RegisterCheckInput {
	courseClassroomId: string;
	isPresent: boolean;
	observation?: string;
	digitalBlackboardUseStatus?: DigitalBlackboardUseStatus;
}

export const useRegisterCheck = () => {
	const { createCheck, isPendingCreateCheck } = useCreateCheckMutation();
	const [submittingId, setSubmittingId] = useState<string | null>(null);
	const [checkOverrides, setCheckOverrides] = useState<
		Record<string, TMonitorAssignmentCheckStatus>
	>({});
	const { enqueue, pendingCount, synchronize } = useOfflineCheckSync();

	const setOverride = useCallback(
		(
			courseClassroomId: string,
			check: TMonitorAssignmentCheckStatus
		) => {
			setCheckOverrides(previous => ({
				...previous,
				[courseClassroomId]: check,
			}));
		},
		[]
	);

	const registerCheck = useCallback(
		async ({
			courseClassroomId,
			isPresent,
			observation,
			digitalBlackboardUseStatus,
		}: RegisterCheckInput) => {
			setSubmittingId(courseClassroomId);
			const offlineId = crypto.randomUUID();
			const payload = {
				courseClassroomId,
				checkDate: getTodayDateString(),
				checkTime: getCurrentTimeString(),
				isPresent,
				observation: observation?.trim() || undefined,
				digitalBlackboardUseStatus,
				offlineId,
			};
			const queuePayload = async () => {
				await enqueue({
					...payload,
					queuedAt: new Date().toISOString(),
				});
				setOverride(courseClassroomId, {
					id: offlineId,
					isPresent,
					checkTime: payload.checkTime,
					observation: payload.observation ?? null,
					digitalBlackboardUseStatus:
						digitalBlackboardUseStatus ?? null,
					syncStatus: 'pending',
				});
			};

			try {
				if (!navigator.onLine) {
					await queuePayload();
					return true;
				}
				const res = await createCheck(payload);

				const created = res.data.data;
				setOverride(courseClassroomId, {
					id: created.id,
					isPresent: created.isPresent,
					checkTime: created.checkTime,
					observation: created.observation ?? null,
					digitalBlackboardUseStatus:
						created.digitalBlackboardUseStatus,
					syncStatus: 'synced',
				});

				return true;
			} catch (error) {
				const networkFailure =
					!navigator.onLine ||
					(isAxiosError(error) && !error.response);
				if (networkFailure) {
					await queuePayload();
					return true;
				}
				// El error ya se notifica globalmente
				return false;
			} finally {
				setSubmittingId(null);
			}
		},
		[createCheck, enqueue, setOverride]
	);
	const synchronizeChecks = useCallback(async () => {
		await synchronize();
		setCheckOverrides({});
	}, [synchronize]);

	return {
		registerCheck,
		checkOverrides,
		submittingId,
		isRegistering: isPendingCreateCheck,
		pendingSyncCount: pendingCount,
		synchronize: synchronizeChecks,
	};
};
