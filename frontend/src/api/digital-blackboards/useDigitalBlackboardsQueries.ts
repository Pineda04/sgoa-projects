import { useQuery } from '@tanstack/react-query';
import { digitalBlackboardsApi } from './digital-blackboards.api';
import { digitalBlackboardsKeys } from './digital-blackboards.keys';
import { STALE_TIME } from '@config/lib';

export const useGetAllDigitalBlackboards = () =>
	useQuery({
		queryKey: digitalBlackboardsKeys.all,
		queryFn: digitalBlackboardsApi.getAllDigitalBlackboards,
		retry: false,
		refetchOnWindowFocus: false,
		staleTime: STALE_TIME.VERY_LONG,
		select: res => res.data.data,
	});

export const useGetDigitalBlackboard = (id: string) =>
	useQuery({
		queryKey: digitalBlackboardsKeys.detail(id),
		queryFn: () => digitalBlackboardsApi.getOneDigitalBlackboard(id),
		enabled: Boolean(id),
		staleTime: STALE_TIME.MEDIUM,
		select: res => res.data.data,
	});
