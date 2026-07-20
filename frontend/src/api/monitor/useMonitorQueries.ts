import { useQuery } from '@tanstack/react-query';
import { monitorApi } from './monitor.api';
import { monitorKeys } from './monitor.keys';
import { STALE_TIME } from '@config/lib';

const CURRENT_ASSIGNMENTS_REFETCH_INTERVAL = 60 * 1000;

export const useGetCurrentAssignments = () =>
	useQuery({
		queryKey: monitorKeys.currentAssignments(),
		queryFn: () => monitorApi.getCurrentAssignments(),
		staleTime: STALE_TIME.SHORT,
		refetchInterval: CURRENT_ASSIGNMENTS_REFETCH_INTERVAL,
		select: res => res.data.data,
	});
