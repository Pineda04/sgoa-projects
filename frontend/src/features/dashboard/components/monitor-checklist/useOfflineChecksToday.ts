import { useLiveQuery } from 'dexie-react-hooks';
import { TMonitorAssignmentCheckStatus } from '@api/monitor';
import { db } from '@config/lib';
import { getTodayDateString } from './checklist.utils';

// Feature: expone de forma reactiva los registros locales (Dexie) del día del monitor
// actual como un mapa courseClassroomId -> estado de verificación. Esto conserva la
// asistencia registrada offline aunque MonitorChecklist se desmonte (navegar a otra
// página), evitando que parezca pendiente y se generen registros duplicados al sincronizar.
export const useOfflineChecksToday = (email?: string) =>
	useLiveQuery(async () => {
		const records = await db.offlineChecks
			.where('[email+checkDate]')
			.equals([email ?? '', getTodayDateString()])
			.toArray();

		return records
			.filter(record =>
				['PENDING', 'SYNCING', 'SYNCED', 'ERROR'].includes(record.syncStatus)
			)
			.reduce<Record<string, TMonitorAssignmentCheckStatus>>(
			(acc, record) => {
				acc[record.courseClassroomId] = {
					id: record.offlineId,
					isPresent: record.isPresent,
					checkTime: record.checkTime,
					observation: record.observation ?? null,
				};
				return acc;
			},
			{}
			);
	}, [email], {} as Record<string, TMonitorAssignmentCheckStatus>);

export const useOfflineSyncIssues = (email?: string) =>
	useLiveQuery(
		() =>
			db.offlineChecks
				.where('email')
				.equals(email ?? '')
				.filter(
					check =>
						check.syncStatus === 'CONFLICT' || check.syncStatus === 'REJECTED'
				)
				.toArray(),
		[email],
		[]
	);
