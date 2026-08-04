import { useCallback, useState } from 'react';
import { useUpdateCheckMutation } from '@api/monitor';
import { db } from '@config/lib';
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
	checkTime?: string;
	isLocalOnly?: boolean;
}

export const useRegisterCheck = (email?: string, isOnline = true) => {
	const { updateCheck } = useUpdateCheckMutation();
	const [submittingId, setSubmittingId] = useState<string | null>(null);

	const saveOffline = useCallback(
		async ({
			courseClassroomId,
			isPresent,
			observation,
			checkTime,
		}: RegisterCheckInput & { checkTime?: string }) => {
			const checkDate = getTodayDateString();
			const resolvedCheckTime = checkTime ?? getCurrentTimeString();

			await db.transaction('rw', db.offlineChecks, async () => {
				const existing = await db.offlineChecks
					.where('[email+checkDate]')
					.equals([email ?? '', checkDate])
					.filter(check => check.courseClassroomId === courseClassroomId)
					.first();

				if (existing) {
					if (existing.syncStatus === 'PENDING') {
						await db.offlineChecks.update(existing.offlineId, {
							isPresent,
							checkTime: resolvedCheckTime,
							observation: observation?.trim() || undefined,
						});
					}
					return;
				}

				await db.offlineChecks.add({
					offlineId: crypto.randomUUID(),
					email: email ?? '',
					courseClassroomId,
					checkDate,
					checkTime: resolvedCheckTime,
					isPresent,
					observation: observation?.trim() || undefined,
					syncStatus: 'PENDING',
					createdAt: Date.now(),
				});
			});
		},
		[email]
	);

	const registerCheck = useCallback(
		async ({ courseClassroomId, isPresent, observation }: RegisterCheckInput) => {
			setSubmittingId(courseClassroomId);

			try {
				await saveOffline({ courseClassroomId, isPresent, observation });
				return true;
			} catch (error) {
				console.error('Error al guardar verificación localmente:', error);
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
			checkTime,
			isLocalOnly,
		}: EditCheckInput) => {
			setSubmittingId(courseClassroomId);

			try {
				if (!isOnline || isLocalOnly) {
					await saveOffline({ courseClassroomId, isPresent, observation, checkTime });
					return true;
				}

				await updateCheck({
					id: checkId,
					isPresent,
					observation: observation?.trim() ?? '',
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
		isRegistering: !!submittingId,
	};
};
