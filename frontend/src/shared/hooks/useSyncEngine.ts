import { useCallback, useEffect, useRef, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, queryClient, cleanupSyncedChecks } from '@config/lib';
import { monitorApi, monitorKeys } from '@api/monitor';
import { useIsOnline } from './useIsOnline';

export type TSyncStatus = 'SYNCED' | 'OFFLINE' | 'SYNCING' | 'ERROR';

export const useSyncEngine = (email?: string) => {
	const isOnline = useIsOnline();
	const [status, setStatus] = useState<TSyncStatus>(
		isOnline ? 'SYNCED' : 'OFFLINE'
	);
	const statusRef = useRef(status);
	statusRef.current = status;
	// Cerrojo síncrono: impide que dos sincronizaciones envíen el mismo lote cuando
	// useLiveQuery emite antes de que React re-renderice con el nuevo estado.
	const isSyncingRef = useRef(false);

	// Escuchar cambios reactivos en los checks pendientes del monitor actual
	const pendingChecks = useLiveQuery(
		() =>
			db.offlineChecks
				.where('[email+syncStatus]')
				.equals([email ?? '', 'PENDING'])
				.sortBy('createdAt'),
		[email],
		[] // valor inicial
	);

	const pendingCount = pendingChecks.length;

	const syncPendingChecks = useCallback(async () => {
		if (!isOnline) {
			setStatus('OFFLINE');
			return;
		}

		if (pendingCount === 0) {
			setStatus('SYNCED');
			return;
		}

		if (isSyncingRef.current) return;
		isSyncingRef.current = true;
		setStatus('SYNCING');

		try {
			// 1. Mapear al DTO esperado por el backend
			const checksToSync = pendingChecks.map(check => ({
				courseClassroomId: check.courseClassroomId,
				checkDate: check.checkDate,
				checkTime: check.checkTime,
				isPresent: check.isPresent,
				observation: check.observation,
				digitalBlackboardUseStatus: check.digitalBlackboardUseStatus,
				offlineId: check.offlineId,
			}));

			// 2. Enviar lote al backend
			const result = (await monitorApi.batchSync({ checks: checksToSync })).data
				.data;

			// 3. Marcar solo los registros persistidos. Los conflictos y rechazos
			// se conservan para que el monitor los revise y descarte explícitamente.
			await db.transaction('rw', db.offlineChecks, async () => {
				const failedIds = new Set([
					...result.conflictIds,
					...result.skippedIds,
					...result.rejectedIds,
				]);
				const idsToSync = pendingChecks
					.map(check => check.offlineId)
					.filter(id => !failedIds.has(id));

				if (idsToSync.length > 0) {
					await db.offlineChecks
						.where('offlineId')
						.anyOf(idsToSync)
						.modify({ syncStatus: 'SYNCED' });
				}

				if (result.conflictIds.length > 0) {
					await db.offlineChecks
						.where('offlineId')
						.anyOf(result.conflictIds)
						.modify({
							syncStatus: 'CONFLICT',
							syncReason:
								'Otro monitor ya registró esta verificación.',
						});
				}

				if (result.rejectedIds.length > 0) {
					await db.offlineChecks
						.where('offlineId')
						.anyOf(result.rejectedIds)
						.modify({
							syncStatus: 'REJECTED',
							syncReason:
								'La sección ya no existe y no puede sincronizarse.',
						});
				}
			});

			const hasFailures =
				result.conflictIds.length > 0 ||
				result.skippedIds.length > 0 ||
				result.rejectedIds.length > 0;
			setStatus(hasFailures ? 'ERROR' : 'SYNCED');

			// 4. Limpieza: descartar SYNCED antiguos (política de retención)
			await cleanupSyncedChecks(email);

			// 5. Invalidar la query de asignaciones para refrescar los datos desde el servidor
			await queryClient.invalidateQueries({
				queryKey: monitorKeys.currentAssignments(email),
			});
		} catch (error) {
			console.error('Error durante la sincronización masiva:', error);
			// Las filas se conservan en PENDING; se reintenta manualmente o al reconectar
			setStatus('ERROR');
		} finally {
			isSyncingRef.current = false;
		}
	}, [pendingChecks, pendingCount, isOnline, email]);

	// La referencia evita reintentar por cada emisión de useLiveQuery.
	const syncRef = useRef(syncPendingChecks);
	syncRef.current = syncPendingChecks;

	// Reaccionar únicamente a cambios de conectividad.
	useEffect(() => {
		if (isOnline && statusRef.current !== 'ERROR') void syncRef.current();
		else setStatus('OFFLINE');
	}, [isOnline]);

	// Cuando la cantidad de pendientes cambia y estamos online, intentar sincronizar.
	// Si quedó en ERROR no se reintenta en bucle: se espera reintento manual o reconexión.
	useEffect(() => {
		if (
			pendingCount > 0 &&
			isOnline &&
			!isSyncingRef.current &&
			status !== 'ERROR'
		) {
			syncPendingChecks();
		}
	}, [pendingCount, syncPendingChecks, status, isOnline]);

	return { status, pendingCount, forceSync: syncPendingChecks };
};
