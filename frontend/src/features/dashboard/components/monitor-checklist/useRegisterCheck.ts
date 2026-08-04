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
}

export const useRegisterCheck = (email?: string) => {
	const { updateCheck } = useUpdateCheckMutation();
	const [submittingId, setSubmittingId] = useState<string | null>(null);

	const registerCheck = useCallback(
		async ({ courseClassroomId, isPresent, observation }: RegisterCheckInput) => {
			setSubmittingId(courseClassroomId);

			try {
				const offlineId = crypto.randomUUID();
				const checkDate = getTodayDateString();
				const checkTime = getCurrentTimeString();

				// Feature: evitar registros duplicados del día (misma clase+curso), que
				// al sincronizar crearían dos asistencias en el backend. La lectura y la
				// escritura se envuelven en una transacción para que dos llamadas
				// concurrentes no inserten dos registros.
				await db.transaction('rw', db.offlineChecks, async () => {
					const existing = await db.offlineChecks
						.where('[email+checkDate]')
						.equals([email ?? '', checkDate])
						.filter(check => check.courseClassroomId === courseClassroomId)
						.first();

					if (existing) {
						// Si aún no se sincronizó, se corrige en lugar de duplicarlo; si ya
						// se sincronizó no se toca (el servidor conserva la versión enviada).
						if (existing.syncStatus === 'PENDING') {
							await db.offlineChecks.update(existing.offlineId, {
								isPresent,
								checkTime,
								observation: observation?.trim() || undefined,
							});
						}
						return;
					}

					// 1. Guardar localmente en Dexie
					await db.offlineChecks.add({
						offlineId,
						email: email ?? '',
						courseClassroomId,
						checkDate,
						checkTime,
						isPresent,
						observation: observation?.trim() || undefined,
						syncStatus: 'PENDING',
						createdAt: Date.now(),
					});
				});

				return true;
			} catch (error) {
				console.error('Error al guardar verificación localmente:', error);
				return false;
			} finally {
				setSubmittingId(null);
			}
		},
		[email]
	);

	// Feature: a diferencia de registerCheck (que corrige localmente mientras el check
	// sigue PENDING), editCheck corrige un check que el servidor ya confirmó: requiere
	// conexión y pasa siempre por el PATCH del backend. useUpdateCheckMutation invalida
	// las queries de asignaciones al terminar, así que la UI se refresca sola.
	const editCheck = useCallback(
		async ({
			checkId,
			courseClassroomId,
			isPresent,
			observation,
		}: EditCheckInput) => {
			setSubmittingId(courseClassroomId);

			try {
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
		[updateCheck]
	);

	return {
		registerCheck,
		editCheck,
		submittingId,
		isRegistering: !!submittingId,
	};
};
