import { useCallback, useEffect, useState } from 'react';
import { isAxiosError } from 'axios';
import { monitorApi, monitorKeys } from '@api/monitor';
import { queryClient } from '@config/lib';
import { useAuth } from '@config/providers';
import {
	getQueuedChecks,
	removeQueuedCheck,
	saveQueuedCheck,
	type TQueuedMonitorCheck,
} from './offline-checks.storage';

export const useOfflineCheckSync = () => {
	const { authState } = useAuth();
	const ownerUserId = authState.user?.sub ?? null;
	const [pendingCount, setPendingCount] = useState(0);

	const refreshPendingCount = useCallback(async () => {
		setPendingCount(ownerUserId ? (await getQueuedChecks(ownerUserId)).length : 0);
	}, [ownerUserId]);

	const synchronize = useCallback(async () => {
		if (!navigator.onLine || !ownerUserId) return;
		const queued = await getQueuedChecks(ownerUserId);
		for (const check of queued) {
			try {
				await monitorApi.createCheck({
					courseClassroomId: check.courseClassroomId,
					checkDate: check.checkDate,
					checkTime: check.checkTime,
					isPresent: check.isPresent,
					observation: check.observation,
					offlineId: check.offlineId,
					digitalBlackboardUseStatus:
						check.digitalBlackboardUseStatus,
				});
				await removeQueuedCheck(check.offlineId);
			} catch (error) {
				if (!navigator.onLine || (isAxiosError(error) && !error.response)) break;
			}
		}
		await refreshPendingCount();
		await queryClient.invalidateQueries({
			queryKey: monitorKeys.currentAssignments(),
		});
	}, [ownerUserId, refreshPendingCount]);

	useEffect(() => {
		void refreshPendingCount();
		const handleOnline = () => void synchronize();
		window.addEventListener('online', handleOnline);
		return () => window.removeEventListener('online', handleOnline);
	}, [refreshPendingCount, synchronize]);

	const enqueue = useCallback(
		async (check: Omit<TQueuedMonitorCheck, 'ownerUserId'>) => {
			if (!ownerUserId) return;
			await saveQueuedCheck({ ...check, ownerUserId });
			await refreshPendingCount();
		},
		[ownerUserId, refreshPendingCount]
	);

	return { enqueue, pendingCount, synchronize };
};
