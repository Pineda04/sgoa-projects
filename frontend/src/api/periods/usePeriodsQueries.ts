import { useQuery } from '@tanstack/react-query';
import { academicPeriodsApi } from './periods.api';
import { academicPeriodsKeys } from './periods.keys';
import { saveCurrentAcademicPeriod, STALE_TIME } from '@config';
import { useAuth } from '@config/providers';

export const useGetCurrentAcademicPeriod = (options?: {
	enabled?: boolean;
	email?: string;
}) => {
	const { enabled = true, email } = options ?? {};
	const sessionEmail = useAuth().authState.user?.email;
	const cacheEmail = email ?? sessionEmail;

	return useQuery({
		queryKey: academicPeriodsKeys.current(cacheEmail),
		queryFn: async () => {
			const res = await academicPeriodsApi.getCurrentAcademicPeriod();
			// Feature: sobreescribir la caché local (Dexie) en cada fetch exitoso
			// para mostrar el período vigente sin red.
			try {
				if (cacheEmail) await saveCurrentAcademicPeriod(cacheEmail, res.data.data);
			} catch (error) {
				console.warn('No se pudo actualizar la caché del período:', error);
			}
			return res;
		},
		enabled,
		retry: false,
		refetchOnWindowFocus: false,
		staleTime: STALE_TIME.LONG,
		select: res => res.data.data,
	});
};

export const useGetAcademicPeriods = (year?: string, pac?: string, modality?: string) =>
	useQuery({
		queryKey: academicPeriodsKeys.lists(year, pac, modality),
		queryFn: () => academicPeriodsApi.getAcademicPeriods(year, pac, modality),
		retry: false,
		refetchOnWindowFocus: false,
		staleTime: STALE_TIME.LONG,
		select: res => res.data.data,
	});

export const useGetAcademicPeriodNextToCreate = () =>
	useQuery({
		queryKey: academicPeriodsKeys.next(),
		queryFn: () => academicPeriodsApi.getAcademicPeriodNextToCreate(),
		retry: false,
		refetchOnWindowFocus: false,
		staleTime: STALE_TIME.LONG,
		select: res => res.data.data,
	});
