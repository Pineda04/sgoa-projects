import { useLiveQuery } from 'dexie-react-hooks';
import { getCachedAssignments } from '@config/lib';

// Feature: expone de forma reactiva las asignaciones cacheadas en Dexie por email
// del monitor, para renderizarlas sin red (sin llamar a /monitor/current-assignments).
export const useCachedAssignments = (email?: string | null) =>
	useLiveQuery(
		() => (email ? getCachedAssignments(email) : Promise.resolve([])),
		[email],
		[]
	);
