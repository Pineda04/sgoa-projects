import { useQuery } from '@tanstack/react-query';
import { conditionsApi } from './conditions.api';
import { conditionsKeys } from './conditions.keys';
import { STALE_TIME } from '@config/lib';

export const useGetAllConditions = () =>
	useQuery({
		queryKey: conditionsKeys.all,
		queryFn: conditionsApi.getAllConditions,
		retry: false,
		refetchOnWindowFocus: false,
		staleTime: STALE_TIME.VERY_LONG,
		select: res => res.data.data,
	});
