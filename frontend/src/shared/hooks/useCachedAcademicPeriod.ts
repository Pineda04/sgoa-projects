import { useLiveQuery } from 'dexie-react-hooks';
import { getCachedAcademicPeriod } from '@config/lib';

// Feature: expone de forma reactiva el período académico vigente cacheado en Dexie
// por email, para mostrar el título sin red (sin llamar a /academic-periods/current).
export const useCachedAcademicPeriod = (email?: string | null) =>
	useLiveQuery(
		() => (email ? getCachedAcademicPeriod(email) : Promise.resolve(null)),
		[email],
		null
	);
