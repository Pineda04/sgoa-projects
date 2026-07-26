import { useQuery } from '@tanstack/react-query';
import {
	teacherCategoriesApi,
	teacherDepartmentPositionApi,
	teachersApi,
} from './teachers.api';
import {
	coordinatorsKeys,
	teacherCategoriesKeys,
	teachersKeys,
} from './teachers.keys';
import { usersKeys } from '../users';
import { usePaginationParams } from '@shared/hooks';
import { STALE_TIME } from '@config/lib';
import { useAuth } from '@config/providers';

export const useGetTeachers = (
	filters?: {
		searchTerm?: string;
		categoryId?: string;
		contractTypeId?: string;
	},
	options?: { enabled?: boolean }
) => {
	const { page, size } = usePaginationParams();
	return useQuery({
		queryKey: usersKeys.list(page, size, filters),
		queryFn: () => teachersApi.getAllTeachers(page, size, filters),
		staleTime: STALE_TIME.MEDIUM,
		enabled: options?.enabled,
		select: res => res.data,
	});
};

export const useGetTeacher = (id: string) =>
	useQuery({
		queryKey: usersKeys.detail(String(id)),
		queryFn: () => teachersApi.getOneTeacher(String(id)),
		enabled: Boolean(id),
		staleTime: STALE_TIME.MEDIUM,
		select: res => res.data,
	});

export const useGetTeachersBySearchTerm = (searchTerm: string) => {
	const { page, size } = usePaginationParams();
	return useQuery({
		queryKey: usersKeys.search(searchTerm, page),
		queryFn: () =>
			teachersApi.getTeachersBySearchTerm(searchTerm, page, size),
		enabled: searchTerm.length >= 2,
		staleTime: STALE_TIME.SHORT,
		select: res => res.data,
	});
};

const AUTOCOMPLETE_PAGE = 1;
const AUTOCOMPLETE_SIZE = 20;

export const useGetTeachersForAutocomplete = (searchTerm: string) =>
	useQuery({
		queryKey: teachersKeys.autocomplete(searchTerm),
		queryFn: () =>
			teachersApi.getAllTeachers(AUTOCOMPLETE_PAGE, AUTOCOMPLETE_SIZE, {
				searchTerm,
			}),
		enabled: searchTerm.length >= 2,
		staleTime: STALE_TIME.SHORT,
		select: res => res.data,
	});

export const useGetCurrentTeacher = () => {
	const {
		authState: { user },
	} = useAuth();

	return useQuery({
		queryKey: teachersKeys.detail(user?.sub ?? ''),
		queryFn: teachersApi.getCurrentTeacher,
		select: res => res.data.data,
	});
};

export const useGetTeacherPosition = (centerDepartmentId?: string) =>
	useQuery({
		queryKey: [
			...teachersKeys.position(),
			centerDepartmentId ?? '',
		] as const,
		queryFn: () =>
			teacherDepartmentPositionApi.getTeacherPosition(
				String(centerDepartmentId)
			),
		enabled: Boolean(centerDepartmentId),
		staleTime: STALE_TIME.MEDIUM,
		select: res => res.data.data,
	});

export const useGetTeacherByUserId = (id: string) =>
	useQuery({
		queryKey: teachersKeys.detail(String(id)),
		queryFn: () => teachersApi.getOneTeacherByUserId(String(id)),
		enabled: Boolean(id),
		staleTime: STALE_TIME.MEDIUM,
		select: res => res.data.data,
	});

export const useGetAllTeacherCategories = () =>
	useQuery({
		queryKey: teacherCategoriesKeys.all,
		queryFn: teacherCategoriesApi.getAllTeacherCategories,
		retry: false,
		refetchOnWindowFocus: false,
		staleTime: STALE_TIME.VERY_LONG,
		select: res => res.data.data,
	});

export const useGetTeachersCoordinator = (
	centerDepartmentId: string,
	filters?: {
		searchTerm?: string;
		categoryId?: string;
		contractTypeId?: string;
	}
) => {
	const { page, size } = usePaginationParams();

	return useQuery({
		queryKey: teachersKeys.coordinator(
			page,
			size,
			centerDepartmentId,
			filters
		),
		queryFn: () =>
			teachersApi.getAllTeachersCoordinator(
				page,
				size,
				centerDepartmentId,
				filters
			),
		enabled: Boolean(centerDepartmentId),
		staleTime: STALE_TIME.MEDIUM,
		refetchOnMount: false,
		select: res => res.data,
	});
};

export const useGetAllMyCoordinations = (options?: { enabled?: boolean }) =>
	useQuery({
		queryKey: coordinatorsKeys.my,
		queryFn: teacherDepartmentPositionApi.getAllMyCoordinations,
		staleTime: STALE_TIME.LONG,
		select: res => res.data.data,
		enabled: options?.enabled ?? true,
	});
