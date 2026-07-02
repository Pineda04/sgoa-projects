import { useQuery } from '@tanstack/react-query';
import { coursesApi, courseClassroomsApi } from './courses.api';
import { STALE_TIME } from '@config';
import { usePaginationParams } from '@shared';
import { coursesKeys } from './courses.keys';
import { academicAssignmentCoordinatorKeys } from '../assignment-reports';

export const useGetCoursesByCenterDepartment = (
	centerDepartmentId: string,
	periodId: string
) =>
	useQuery({
		queryKey: [
			'courseClassrooms',
			'centerDepartment',
			centerDepartmentId,
			'period',
			periodId,
		],
		queryFn: () =>
			courseClassroomsApi.getAllByCenterDepartment(
				centerDepartmentId,
				periodId
			),
		enabled: Boolean(centerDepartmentId && periodId),
		retry: false,
		refetchOnWindowFocus: false,
		staleTime: STALE_TIME.MEDIUM,
		select: res => res.data.data,
	});

export const useGetAllCourseClassrooms = () =>
	useQuery({
		queryKey: ['courseClassrooms', 'all'],
		queryFn: () => courseClassroomsApi.getAll(),
		retry: false,
		refetchOnWindowFocus: false,
		staleTime: STALE_TIME.MEDIUM,
		select: res => res.data.data,
	});

export const useGetCoursesByTeacher = (teacherId: string) =>
	useQuery({
		queryKey: ['courseClassrooms', 'teacher', teacherId],
		queryFn: () => courseClassroomsApi.getByTeacher(teacherId),
		enabled: Boolean(teacherId),
		retry: false,
		refetchOnWindowFocus: false,
		staleTime: STALE_TIME.MEDIUM,
		select: res => res.data.data,
	});

export const useGetCourseClassroomById = (id?: string) =>
	useQuery({
		queryKey: ['courseClassrooms', 'detail', id ?? ''],
		queryFn: () => courseClassroomsApi.getCourseClassroomById(id!),
		enabled: Boolean(id),
		retry: false,
		refetchOnWindowFocus: false,
		staleTime: STALE_TIME.MEDIUM,
		select: res => res.data.data,
	});

export const useGetAllCourses = (
	isActive: boolean = false,
	searchTerm: string
) => {
	const { page, size } = usePaginationParams();

	return useQuery({
		queryKey: ['courses', 'all', searchTerm, page, size],
		queryFn: () => coursesApi.getAllCourses(searchTerm, page, size),
		retry: false,
		enabled: isActive,
		refetchOnWindowFocus: false,
		staleTime: STALE_TIME.MEDIUM,
		select: res => res.data,
	});
};

export const useGetAllCoursesCoordinatorByPeriod = (
	periodId?: string,
	centerDepartmentId?: string
) =>
	useQuery({
		queryKey: coursesKeys.periodCenter(
			periodId ?? '',
			centerDepartmentId ?? ''
		),
		queryFn: () =>
			courseClassroomsApi.getAllCoursesByPeriodIdAndCenter(
				periodId!,
				centerDepartmentId!
			),
		enabled: Boolean(periodId && centerDepartmentId),
		retry: false,
		refetchOnWindowFocus: false,
		staleTime: STALE_TIME.MEDIUM,
		select: res => res.data.data,
	});

export const useGetCourseById = (id: string) =>
	useQuery({
		queryKey: ['courses', 'detail', id],
		queryFn: () => coursesApi.getCourseById(id),
		enabled: Boolean(id),
		retry: false,
		refetchOnWindowFocus: false,
		staleTime: STALE_TIME.VERY_LONG,
		select: res => res.data.data,
	});

export const useSearchCourses = (
	centerDepartmentId: string | undefined,
	searchTerm: string
) => {
	const { page, size } = usePaginationParams();

	return useQuery({
		queryKey: [
			'courses',
			'search',
			centerDepartmentId,
			searchTerm,
			page,
			size,
		],
		queryFn: () =>
			coursesApi.searchCourse(centerDepartmentId ?? '', searchTerm, page, size),
		enabled: Boolean(
			searchTerm !== ''
				? searchTerm.length >= 3 && !!centerDepartmentId
				: centerDepartmentId
		),
		retry: false,
		refetchOnWindowFocus: false,
		staleTime: STALE_TIME.VERY_LONG,
		select: res => res.data,
	});
};

export const useGetCurrentUserCourses = () =>
	useQuery({
		queryKey: coursesKeys.current(),
		queryFn: courseClassroomsApi.getCurrentUserCourses,
		retry: false,
		refetchOnWindowFocus: false,
		staleTime: STALE_TIME.MEDIUM,
		select: res => res.data.data,
	});

export const useGetCoursesCenterDepartmentBySearchTerm = (
	centerDepartmentId: string,
	searchTerm: string
) => {
	const { page, size } = usePaginationParams();
	return useQuery({
		queryKey: academicAssignmentCoordinatorKeys.searchCenterDepartment(
			centerDepartmentId,
			searchTerm,
			page
		),
		queryFn: () =>
			coursesApi.getCoursesCenterDepartmentBySearchTerm(
				centerDepartmentId,
				searchTerm,
				page,
				size
			),
		enabled: searchTerm.length >= 2,
		staleTime: STALE_TIME.SHORT,
		select: res => res.data,
	});
};
