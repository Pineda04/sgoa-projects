import { useCallback, useEffect, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, queryClient } from '@config/lib';
import { monitorApi, monitorKeys } from '@api/monitor';

export type TSyncStatus = 'SYNCED' | 'OFFLINE' | 'SYNCING';

export const useSyncEngine = () => {
	const [status, setStatus] = useState<TSyncStatus>(
		navigator.onLine ? 'SYNCED' : 'OFFLINE'
	);

	// Escuchar cambios reactivos en los checks pendientes
	const pendingChecks = useLiveQuery(
		() => db.offlineChecks.where('syncStatus').equals('PENDING').sortBy('createdAt'),
		[],
		[] // valor inicial
	);

	const pendingCount = pendingChecks.length;

	const syncPendingChecks = useCallback(async () => {
		if (!navigator.onLine) {
			setStatus('OFFLINE');
			return;
		}

		if (pendingCount === 0) {
			setStatus('SYNCED');
			return;
		}

		setStatus('SYNCING');

		try {
			// 1. Mapear al DTO esperado por el backend
			const checksToSync = pendingChecks.map(check => ({
				courseClassroomId: check.courseClassroomId,
				checkDate: check.checkDate,
				checkTime: check.checkTime,
				isPresent: check.isPresent,
				observation: check.observation,
				offlineId: check.offlineId,
			}));

			// 2. Enviar lote al backend
			await monitorApi.batchSync({ checks: checksToSync });

			// 3. Si fue exitoso (200 OK), marcar como SYNCED en local
			await db.transaction('rw', db.offlineChecks, async () => {
				const idsToUpdate = pendingChecks.map(c => c.offlineId);
				await db.offlineChecks
					.where('offlineId')
					.anyOf(idsToUpdate)
					.modify({ syncStatus: 'SYNCED' });
			});

			setStatus('SYNCED');

			// 4. Invalidar la query de asignaciones para refrescar los datos desde el servidor
			await queryClient.invalidateQueries({
				queryKey: monitorKeys.currentAssignments(),
			});
		} catch (error) {
			console.error('Error durante la sincronización masiva:', error);
			// Si falla por red u otro motivo, se quedan en PENDING
			setStatus(navigator.onLine ? 'SYNCED' : 'OFFLINE');
		}
	}, [pendingChecks, pendingCount]);

	// Observar cambios en la red (Online / Offline)
	useEffect(() => {
		const handleOnline = () => syncPendingChecks();
		const handleOffline = () => setStatus('OFFLINE');

		window.addEventListener('online', handleOnline);
		window.addEventListener('offline', handleOffline);

		return () => {
			window.removeEventListener('online', handleOnline);
			window.removeEventListener('offline', handleOffline);
		};
	}, [syncPendingChecks]);

	// Cuando la cantidad de pendientes cambia y estamos online, intentar sincronizar
	useEffect(() => {
		if (pendingCount > 0 && navigator.onLine && status !== 'SYNCING') {
			syncPendingChecks();
		}
	}, [pendingCount, syncPendingChecks, status]);

	return { status, pendingCount, forceSync: syncPendingChecks };
};
