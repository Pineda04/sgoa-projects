import { useQuery } from '@tanstack/react-query';
import { connectivitiesApi } from './connectivities.api';
import { connectivitiesKeys } from './connectivities.keys';
import { STALE_TIME } from '@config/lib';

export const useGetAllConnectivities = () =>
	useQuery({
		queryKey: connectivitiesKeys.all,
		queryFn: connectivitiesApi.getAllConnectivities,
		retry: false,
		refetchOnWindowFocus: false,
		staleTime: STALE_TIME.VERY_LONG,
		select: res => res.data.data,
	});
