import { useQuery } from '@tanstack/react-query';
import { monitorApi } from './monitor.api';
import { monitorKeys } from './monitor.keys';
import { TCheckFilters, TReportFilters } from './monitor.types';
import { STALE_TIME, saveCurrentAssignments } from '@config/lib';
import { useAuth } from '@config/providers';
import { useDebounce, usePaginationParams } from '@shared/hooks';

const CURRENT_ASSIGNMENTS_REFETCH_INTERVAL = 60 * 1000;
const FILTERS_DEBOUNCE_DELAY = 400;

export const useGetCurrentAssignments = (options?: {
	enabled?: boolean;
	email?: string;
}) => {
	const { enabled = true, email } = options ?? {};
	const sessionEmail = useAuth().authState.user?.email;
	const cacheEmail = email ?? sessionEmail;

	return useQuery({
		queryKey: monitorKeys.currentAssignments(cacheEmail),
		queryFn: async () => {
			const res = await monitorApi.getCurrentAssignments();
			// Feature: sobreescribir la caché local (Dexie) en cada fetch exitoso
			// para habilitar el modo offline del monitor.
			try {
				if (cacheEmail) await saveCurrentAssignments(cacheEmail, res.data.data);
			} catch (error) {
				console.warn('No se pudo actualizar la caché de asignaciones:', error);
			}
			return res;
		},
		enabled,
		staleTime: STALE_TIME.SHORT,
		refetchInterval: () =>
			enabled && navigator.onLine ? CURRENT_ASSIGNMENTS_REFETCH_INTERVAL : false,
		select: res => res.data.data,
	});
};

export const useGetMonitorBuildings = () =>
	useQuery({
		queryKey: monitorKeys.buildings(),
		queryFn: monitorApi.getBuildings,
		retry: false,
		refetchOnWindowFocus: false,
		staleTime: STALE_TIME.VERY_LONG,
		select: res => res.data.data,
	});

export const useGetChecks = (filters?: TCheckFilters) => {
	const { page, size } = usePaginationParams();
	const { debouncedValue: debouncedFilters } = useDebounce(
		filters,
		FILTERS_DEBOUNCE_DELAY
	);

	return useQuery({
		queryKey: monitorKeys.checks(page, size, debouncedFilters),
		queryFn: () => monitorApi.getChecks(page, size, debouncedFilters),
		staleTime: STALE_TIME.SHORT,
		select: res => res.data,
	});
};

export const useGetComplianceReport = (filters?: TReportFilters) => {
	const { debouncedValue: debouncedFilters } = useDebounce(
		filters,
		FILTERS_DEBOUNCE_DELAY
	);

	return useQuery({
		queryKey: monitorKeys.report(debouncedFilters),
		queryFn: () => monitorApi.getComplianceReport(debouncedFilters),
		staleTime: STALE_TIME.SHORT,
		select: res => res.data.data,
	});
};
