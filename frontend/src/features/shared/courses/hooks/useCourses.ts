import { useQuery, useMutation } from '@tanstack/react-query';
import { useQueryClient } from '@tanstack/react-query';
import { STALE_TIME } from '@lib/tanstack/query-client';
import {
	coursesApi,
	courseClassroomsApi,
	UpdateCourseDto,
	CreateCourseDto,
} from '../api/courses.api';
import { usePaginationParams } from '@hooks';
import { alertSuccess } from '@utils';

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

export const useGetAllCourses = (
	isActive: boolean = false,
	searchTerm: string
) => {
	const { page, size } = usePaginationParams();

	return useQuery({
		queryKey: ['courses', 'all', searchTerm, page, size],
		queryFn: () => coursesApi.getAll(searchTerm, page, size),
		retry: false,
		enabled: isActive,
		refetchOnWindowFocus: false,
		staleTime: STALE_TIME.MEDIUM,
		select: res => res.data,
	});
};

export const useGetCourseById = (id: string) =>
	useQuery({
		queryKey: ['courses', 'detail', id],
		queryFn: () => coursesApi.getById(id),
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
			coursesApi.search(centerDepartmentId ?? '', searchTerm, page, size),
		enabled: Boolean(
			searchTerm !== ''
				? searchTerm.length >= 3 && !!centerDepartmentId
				: centerDepartmentId

			// searchTerm.length >= 3 || !!centerDepartmentId
		),
		retry: false,
		refetchOnWindowFocus: false,
		staleTime: STALE_TIME.VERY_LONG,
		select: res => res.data,
	});
};

export const useUpdateCourse = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: UpdateCourseDto }) =>
			coursesApi.update(id, data),
		onSuccess: async res => {
			await alertSuccess(res);

			await queryClient.invalidateQueries({ queryKey: ['courses'] });
		},
	});
};

export const useCreateCourse = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: CreateCourseDto) => coursesApi.create(data),
		onSuccess: async res => {
			await alertSuccess(res);

			await queryClient.invalidateQueries({ queryKey: ['courses'] });
		},
	});
};
