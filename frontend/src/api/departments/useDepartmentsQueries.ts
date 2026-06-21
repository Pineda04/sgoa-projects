import { useQuery } from '@tanstack/react-query';
import { departmentsKeys } from './departments.keys';
import { departmentsApi } from './departments.api';
import { TDepartmentWithCoordinations } from './departments.types';
import { STALE_TIME } from '@config';

export const useGetAllDepartments = () =>
	useQuery({
		queryKey: departmentsKeys.all,
		queryFn: departmentsApi.getAllDepartments,
		retry: false,
		refetchOnWindowFocus: false,
		staleTime: STALE_TIME.VERY_LONG,
		select: res => res.data.data as TDepartmentWithCoordinations[],
	});
