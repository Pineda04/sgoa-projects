import { useQuery } from '@tanstack/react-query';
import { centersKeys } from './centers.keys';
import { centersApi } from './centers.api';
import { STALE_TIME } from '@config';

export const useGetAllCenters = (config?: { enabled?: boolean }) =>
	useQuery({
		queryKey: centersKeys.all,
		queryFn: centersApi.getAllCenters,
		retry: false,
		refetchOnWindowFocus: false,
		staleTime: STALE_TIME.VERY_LONG,
		select: res => res.data.data,
		enabled: config?.enabled,
	});

export const useGetCenterById = (centerId: string, config?: { enabled?: boolean }) =>
	useQuery({
		queryKey: centersKeys.detail(centerId),
		queryFn: () => centersApi.getCenterById(String(centerId)),
		enabled: config?.enabled !== false && centerId !== '',
		retry: false,
		refetchOnWindowFocus: false,
		staleTime: STALE_TIME.VERY_LONG,
		select: res => res.data.data,
	});
