import { useCallback, useState } from 'react';
import { TMonitorAssignmentCheckStatus } from '@api/monitor';
import { db } from '@config/lib';
import { getCurrentTimeString, getTodayDateString } from './checklist.utils';

interface RegisterCheckInput {
	courseClassroomId: string;
	isPresent: boolean;
	observation?: string;
}

export const useRegisterCheck = () => {
	const [submittingId, setSubmittingId] = useState<string | null>(null);
	const [checkOverrides, setCheckOverrides] = useState<
		Record<string, TMonitorAssignmentCheckStatus>
	>({});

	const registerCheck = useCallback(
		async ({ courseClassroomId, isPresent, observation }: RegisterCheckInput) => {
			setSubmittingId(courseClassroomId);

			try {
				const offlineId = crypto.randomUUID();
				const checkDate = getTodayDateString();
				const checkTime = getCurrentTimeString();

				// Feature: evitar registros duplicados del día (misma clase+curso), que
				// al sincronizar crearían dos asistencias en el backend.
				const existing = await db.offlineChecks
					.where('courseClassroomId')
					.equals(courseClassroomId)
					.filter(check => check.checkDate === checkDate)
					.first();

				if (existing) return true;

				// 1. Guardar localmente en Dexie
				await db.offlineChecks.add({
					offlineId,
					courseClassroomId,
					checkDate,
					checkTime,
					isPresent,
					observation: observation?.trim() || undefined,
					syncStatus: 'PENDING',
					createdAt: Date.now(),
				});

				// 2. Reflejar inmediatamente en la UI local
				setCheckOverrides(prev => ({
					...prev,
					[courseClassroomId]: {
						id: offlineId, // se usa offlineId como ID temporal
						isPresent,
						checkTime,
						observation: observation?.trim() || null,
					},
				}));

				return true;
			} catch (error) {
				console.error('Error al guardar verificación localmente:', error);
				return false;
			} finally {
				setSubmittingId(null);
			}
		},
		[]
	);

	return {
		registerCheck,
		checkOverrides,
		submittingId,
		isRegistering: !!submittingId,
	};
};
