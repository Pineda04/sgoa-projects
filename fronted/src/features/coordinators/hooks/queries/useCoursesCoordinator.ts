import { useQuery } from '@tanstack/react-query';
import { STALE_TIME } from '@lib/tanstack/query-client';
import { coordinatorsApi } from '@features/coordinators/api';
import { courseKeys } from '@features/teachers';

export const useGetAllCoursesCoordinatorByPeriod = (
	periodId?: string,
	centerDepartmentId?: string
) =>
	useQuery({
		queryKey: courseKeys.periodCenter(
			periodId ?? '',
			centerDepartmentId ?? ''
		),
		queryFn: () =>
			coordinatorsApi.getAllCoursesByPeriodIdAndCenter(
				periodId!,
				centerDepartmentId!
			),
		enabled: Boolean(periodId && centerDepartmentId),
		retry: false,
		refetchOnWindowFocus: false,
		staleTime: STALE_TIME.MEDIUM,
		select: res => res.data.data,
	});

// export const useGetCoursesByPeriod = (periodId: string) =>
// 	useQuery({
// 		queryKey: courseKeys.period(periodId),
// 		queryFn: () => coursesTeacherApi.getAllCoursesByPeriod(periodId),
// 		enabled: Boolean(periodId),
// 		retry: false,
// 		refetchOnWindowFocus: false,
// 		select: res => res.data.data,
// 	});
