import { useQuery } from '@tanstack/react-query';
import { STALE_TIME } from '@lib/tanstack/query-client';
import { degreesApi } from '../../api';
import { undergradKeys, postgradKeys } from '../../constants';

export const useGetAllUndergrads = () =>
	useQuery({
		queryKey: undergradKeys.all,
		queryFn: degreesApi.getAllUndergrads,
		retry: false,
		refetchOnWindowFocus: false,
		staleTime: STALE_TIME.VERY_LONG,
		select: res => res.data.data,
	});

export const useGetAllPostgrads = () =>
	useQuery({
		queryKey: postgradKeys.all,
		queryFn: degreesApi.getAllPostgrads,
		retry: false,
		refetchOnWindowFocus: false,
		staleTime: STALE_TIME.VERY_LONG,
		select: res => res.data.data,
	});
