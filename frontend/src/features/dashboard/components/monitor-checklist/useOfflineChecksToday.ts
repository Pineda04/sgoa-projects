import { useLiveQuery } from 'dexie-react-hooks';
import { TMonitorAssignmentCheckStatus } from '@api/monitor';
import { db } from '@config/lib';
import { getTodayDateString } from './checklist.utils';

// Feature: expone de forma reactiva los registros locales (Dexie) del día como un
// mapa courseClassroomId -> estado de verificación. Esto conserva la asistencia
// registrada offline aunque MonitorChecklist se desmonte (navegar a otra página),
// evitando que parezca pendiente y se generen registros duplicados al sincronizar.
export const useOfflineChecksToday = () =>
	useLiveQuery(async () => {
		const records = await db.offlineChecks
			.where('checkDate')
			.equals(getTodayDateString())
			.toArray();

		return records.reduce<Record<string, TMonitorAssignmentCheckStatus>>(
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
	}, []);
