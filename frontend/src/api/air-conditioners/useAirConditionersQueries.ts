import { useQuery } from '@tanstack/react-query';
import { STALE_TIME } from '@config/lib';
import { airConditionersApi } from './air-conditioners.api';
import { airConditionersKeys } from './air-conditioners.keys';

export const useGetAirConditioners = () =>
	useQuery({
		queryKey: airConditionersKeys.list(),
		queryFn: airConditionersApi.getAllAirConditioners,
		staleTime: STALE_TIME.MEDIUM,
		select: res => res.data.data,
	});

export const useGetAirConditioner = (id: string) =>
	useQuery({
		queryKey: airConditionersKeys.detail(id),
		queryFn: () => airConditionersApi.getOneAirConditioner(id),
		enabled: Boolean(id),
		staleTime: STALE_TIME.MEDIUM,
		select: res => res.data.data,
	});
