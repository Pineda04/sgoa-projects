import { useQuery } from '@tanstack/react-query';
import { monitorApi } from './monitor.api';
import { monitorKeys } from './monitor.keys';
import { usePaginationParams } from '@shared/hooks';
import { STALE_TIME } from '@config/lib';

export const useGetScheduleChecks = () => {
	const { page, size } = usePaginationParams();

	return useQuery({
		queryKey: monitorKeys.list(page),
		queryFn: () => monitorApi.getScheduleChecks(page, size),
		enabled: false,
		staleTime: STALE_TIME.MEDIUM,
		select: res => res.data.data,
	});
};

export const useGetScheduleCheckById = (id: string) =>
	useQuery({
		queryKey: monitorKeys.detail(id),
		queryFn: () => monitorApi.getScheduleCheckById(id),
		enabled: false,
		staleTime: STALE_TIME.MEDIUM,
		select: res => res.data.data,
	});
