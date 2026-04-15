import { useQuery } from '@tanstack/react-query';
import { STALE_TIME } from '@lib/tanstack/query-client';
import { departmentsApi } from '../../api';
import { departmentKeys } from '../../constants/departmentKeys';
import { TDepartmentWithCoordinations } from '../../types';

export const useGetAllDepartments = () =>
	useQuery({
		queryKey: departmentKeys.all,
		queryFn: departmentsApi.getAllDepartments,
		retry: false,
		refetchOnWindowFocus: false,
		staleTime: STALE_TIME.VERY_LONG,
		select: res => res.data.data as TDepartmentWithCoordinations[],
	});
