import { useQuery } from '@tanstack/react-query';
import { positionsKeys } from './positions.keys';
import { positionsApi } from './positions.api';
import { STALE_TIME } from '@config/lib';

export const useGetAllPositions = () =>
	useQuery({
		queryKey: positionsKeys.all,
		queryFn: positionsApi.getAllPositionsForTable, // ← Cambio aquí
		retry: false,
		refetchOnWindowFocus: false,
		staleTime: STALE_TIME.VERY_LONG,
		select: res => res.data.data,
	});
