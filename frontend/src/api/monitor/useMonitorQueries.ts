import { useQuery } from '@tanstack/react-query';
import { monitorApi } from './monitor.api';
import { monitorKeys } from './monitor.keys';
import { TCheckFilters, TReportFilters } from './monitor.types';
import { STALE_TIME } from '@config/lib';
import { useDebounce, usePaginationParams } from '@shared/hooks';

const CURRENT_ASSIGNMENTS_REFETCH_INTERVAL = 60 * 1000;
const FILTERS_DEBOUNCE_DELAY = 400;

export const useGetCurrentAssignments = () =>
	useQuery({
		queryKey: monitorKeys.currentAssignments(),
		queryFn: () => monitorApi.getCurrentAssignments(),
		staleTime: STALE_TIME.SHORT,
		refetchInterval: CURRENT_ASSIGNMENTS_REFETCH_INTERVAL,
		select: res => res.data.data,
	});

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
