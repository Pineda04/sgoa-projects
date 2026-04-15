import { useQuery } from '@tanstack/react-query';
import { STALE_TIME } from '@lib/tanstack/query-client';
import { coursesTeacherApi } from '@features/teachers/api';
import { courseKeys } from '@features/teachers/constants';

export const useGetCurrentUserCourses = () =>
	useQuery({
		queryKey: courseKeys.current(),
		queryFn: coursesTeacherApi.getCurrentUserCourses,
		retry: false,
		refetchOnWindowFocus: false,
		staleTime: STALE_TIME.MEDIUM,
		select: res => res.data.data,
	});