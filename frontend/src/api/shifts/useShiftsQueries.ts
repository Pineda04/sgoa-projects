import { useQuery } from '@tanstack/react-query';
import { shiftsKeys } from './shifts.keys';
import { shiftsApi } from './shifts.api';
import { STALE_TIME } from '@config/lib';

export const useGetAllShifts = () =>
	useQuery({
		queryKey: shiftsKeys.all,
		queryFn: shiftsApi.getAllShifts,
		retry: false,
		refetchOnWindowFocus: false,
		staleTime: STALE_TIME.VERY_LONG,
		select: res => res.data.data,
	});
