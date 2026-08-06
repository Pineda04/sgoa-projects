import { useCallback, useState } from 'react';
import {
	type DigitalBlackboardUseStatus,
	useUpdateCheckMutation,
} from '@api/monitor';
import { db } from '@config/lib';
import { getCurrentTimeString, getTodayDateString } from './checklist.utils';

interface RegisterCheckInput {
	courseClassroomId: string;
	isPresent: boolean;
	observation?: string;
	digitalBlackboardUseStatus?: DigitalBlackboardUseStatus;
}

interface EditCheckInput extends RegisterCheckInput {
	checkId: string;
	checkTime?: string;
	isLocalOnly?: boolean;
}

const getPendingStatus = (): 'PENDING' => 'PENDING';

export const useRegisterCheck = (email?: string, isOnline = true) => {
	const { updateCheck } = useUpdateCheckMutation();
	const [submittingId, setSubmittingId] = useState<string | null>(null);

	const saveOffline = useCallback(
		async ({
			courseClassroomId,
			isPresent,
			observation,
			digitalBlackboardUseStatus,
			checkTime,
		}: RegisterCheckInput & { checkTime?: string }) => {
			const checkDate = getTodayDateString();
			const resolvedCheckTime = checkTime ?? getCurrentTimeString();
			const normalizedObservation = observation?.trim() || undefined;

			await db.transaction('rw', db.offlineChecks, async () => {
				const existing = await db.offlineChecks
					.where('[email+checkDate]')
					.equals([email ?? '', checkDate])
					.filter(
						check => check.courseClassroomId === courseClassroomId
					)
					.first();

				if (existing) {
					if (existing.syncStatus === 'PENDING') {
						const changes = {
							isPresent,
							checkTime: resolvedCheckTime,
							observation: normalizedObservation,
							digitalBlackboardUseStatus: isPresent
								? digitalBlackboardUseStatus
								: undefined,
						};
						await db.offlineChecks.update(
							existing.offlineId,
							changes
						);
					}
					return;
				}

				const offlineCheck = {
					offlineId: crypto.randomUUID(),
					email: email ?? '',
					courseClassroomId,
					checkDate,
					checkTime: resolvedCheckTime,
					isPresent,
					observation: normalizedObservation,
					digitalBlackboardUseStatus,
					syncStatus: getPendingStatus(),
					createdAt: Date.now(),
				};
				await db.offlineChecks.add(offlineCheck);
			});
		},
		[email]
	);

	const registerCheck = useCallback(
		async (input: RegisterCheckInput) => {
			setSubmittingId(input.courseClassroomId);

			try {
				await saveOffline(input);
				return true;
			} catch (error) {
				console.error(
					'Error al guardar verificación localmente:',
					error
				);
				return false;
			} finally {
				setSubmittingId(null);
			}
		},
		[saveOffline]
	);

	const editCheck = useCallback(
		async ({
			checkId,
			courseClassroomId,
			isPresent,
			observation,
			digitalBlackboardUseStatus,
			checkTime,
			isLocalOnly,
		}: EditCheckInput) => {
			setSubmittingId(courseClassroomId);

			try {
				if (!isOnline || isLocalOnly) {
					await saveOffline({
						courseClassroomId,
						isPresent,
						observation,
						digitalBlackboardUseStatus,
						checkTime,
					});
					return true;
				}

				await updateCheck({
					id: checkId,
					isPresent,
					observation: observation?.trim() ?? '',
					digitalBlackboardUseStatus,
				});

				return true;
			} catch {
				// El error ya se notifica globalmente
				return false;
			} finally {
				setSubmittingId(null);
			}
		},
		[updateCheck, saveOffline, isOnline]
	);

	return {
		registerCheck,
		editCheck,
		submittingId,
		isRegistering: Boolean(submittingId),
	};
};
