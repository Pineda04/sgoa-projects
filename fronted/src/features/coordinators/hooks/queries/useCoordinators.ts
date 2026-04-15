import { STALE_TIME } from '@lib/tanstack/query-client';
import { useQuery } from '@tanstack/react-query';
import { coordinatorsApi } from '@features/coordinators/api';
import { coordinatorKeys } from '@features/coordinators/constants';
import { teacherKeys } from '@features/teachers/constants';
import { usePaginationParams } from '@hooks';

export const useGetTeachersCoordinator = (centerDepartmentId: string) => {
	const { page, size } = usePaginationParams();

	return useQuery({
		queryKey: teacherKeys.coordinator(page, size, centerDepartmentId),
		queryFn: () =>
			coordinatorsApi.getAllTeachersCoordinator(
				page,
				size,
				centerDepartmentId
			),
		enabled: Boolean(centerDepartmentId),
		staleTime: STALE_TIME.MEDIUM,
		refetchOnMount: false,
		select: res => res.data,
	});
};

export const useGetAllMyCoordinations = () =>
	useQuery({
		queryKey: coordinatorKeys.my,
		queryFn: coordinatorsApi.getAllMyCoordinations,
		staleTime: STALE_TIME.LONG,
		select: res => res.data.data,
	});
