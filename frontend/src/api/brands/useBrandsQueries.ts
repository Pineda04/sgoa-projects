import { useQuery } from '@tanstack/react-query';
import { brandsApi } from './brands.api';
import { brandsKeys } from './brands.keys';
import { STALE_TIME } from '@config/lib';

export const useGetAllBrands = () =>
	useQuery({
		queryKey: brandsKeys.all,
		queryFn: brandsApi.getAllBrands,
		retry: false,
		refetchOnWindowFocus: false,
		staleTime: STALE_TIME.VERY_LONG,
		select: res => res.data.data,
	});
