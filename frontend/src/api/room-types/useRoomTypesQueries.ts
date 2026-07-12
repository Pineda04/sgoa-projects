import { useQuery } from '@tanstack/react-query';
import { roomTypesApi } from './room-types.api';
import { roomTypesKeys } from './room-types.keys';
import { STALE_TIME } from '@config/lib';

export const useGetAllRoomTypes = () =>
	useQuery({
		queryKey: roomTypesKeys.all,
		queryFn: roomTypesApi.getAllRoomTypes,
		retry: false,
		refetchOnWindowFocus: false,
		staleTime: STALE_TIME.VERY_LONG,
		select: res => res.data.data,
	});
