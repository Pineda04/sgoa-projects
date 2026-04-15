import { STALE_TIME } from '@lib/tanstack';
import { useQuery } from '@tanstack/react-query';
import { userKeys } from '../../constants';
import { usersApi } from '../../api';
import { usePaginationParams } from '@hooks';

export const useGetTeachers = () => {
	const { page, size } = usePaginationParams();
	return useQuery({
		queryKey: userKeys.list(page, size),
		queryFn: () => usersApi.getAllTeachers(page, size),
		staleTime: STALE_TIME.MEDIUM,
		select: res => res.data,
	});
};

export const useGetTeacher = (id: string) =>
	useQuery({
		queryKey: userKeys.detail(String(id)),
		queryFn: () => usersApi.getOneTeacher(String(id)),
		enabled: Boolean(id),
		staleTime: STALE_TIME.MEDIUM,
		select: res => res.data,
	});

export const useGetTeachersBySearchTerm = (searchTerm: string) => {
	const { page, size } = usePaginationParams();
	return useQuery({
		queryKey: userKeys.search(searchTerm, page),
		queryFn: () => usersApi.getTeachersBySearchTerm(searchTerm, page, size),
		enabled: searchTerm.length >= 2,
		staleTime: STALE_TIME.SHORT,
		select: res => res.data,
	});
};
