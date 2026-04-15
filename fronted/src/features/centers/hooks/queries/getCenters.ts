import { useQuery } from '@tanstack/react-query';
import { STALE_TIME } from '@lib/tanstack/query-client';
import { centersApi } from '@features/centers/api/centers.api';
import { centerKeys } from '@features/centers/constants';

export const useGetAllCenters = (config?: { enabled?: boolean }) =>
	useQuery({
		queryKey: centerKeys.all,
		queryFn: centersApi.getAllCenters,
		retry: false,
		refetchOnWindowFocus: false,
		staleTime: STALE_TIME.VERY_LONG,
		select: res => res.data.data,
		enabled: config?.enabled,
	});

export const useGetCenterById = (centerId: string, config?: { enabled?: boolean }) =>
	useQuery({
		queryKey: centerKeys.detail(centerId),
		queryFn: () => centersApi.getCenterById(String(centerId)),
		enabled: config?.enabled !== false && centerId !== '',
		retry: false,
		refetchOnWindowFocus: false,
		staleTime: STALE_TIME.VERY_LONG,
		select: res => res.data.data,
	});
