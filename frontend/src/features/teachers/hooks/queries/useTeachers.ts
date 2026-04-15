import { useQuery } from '@tanstack/react-query';
import { STALE_TIME } from '@lib/tanstack/query-client';
import { teachersApi } from '@features/teachers/api';
import { teacherKeys } from '@features/teachers/constants';
import { useAuth } from '@providers/auth';

// SI CRECE DEMASIADO, SE DEBERá CONSIDERAR SEPARARLOS EN ARCHIVOS INDIVIDUALES

export const useGetCurrentTeacher = () => {
	const {
		authState: { user },
	} = useAuth();

	return useQuery({
		queryKey: teacherKeys.detail(user?.sub ?? ''),
		queryFn: teachersApi.getCurrentTeacher,
		select: res => res.data.data,
	});
};

export const useGetTeacherPosition = (centerDepartmentId?: string) =>
	useQuery({
		queryKey: [
			...teacherKeys.position(),
			centerDepartmentId ?? '',
		] as const,
		queryFn: () =>
			teachersApi.getTeacherPosition(String(centerDepartmentId)),
		enabled: Boolean(centerDepartmentId),
		staleTime: STALE_TIME.MEDIUM,
		select: res => res.data.data,
	});

export const useGetTeacherByUserId = (id: string) =>
	useQuery({
		queryKey: teacherKeys.detail(String(id)),
		queryFn: () => teachersApi.getOneTeacherByUserId(String(id)),
		enabled: Boolean(id),
		staleTime: STALE_TIME.MEDIUM,
		select: res => res.data.data,
	});
