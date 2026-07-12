import { useQuery } from '@tanstack/react-query';
import { classroomsApi } from './classrooms.api';
import { classroomsKeys } from './classrooms.keys';
import { STALE_TIME } from '@config';

export const useGetClassroomsBySearchTerm = (
	searchTerm: string,
	page: number = 1,
	size: number = 50
) =>
	useQuery({
		queryKey: classroomsKeys.search(searchTerm, page),
		queryFn: () => classroomsApi.getClassroomsBySearchTerm(searchTerm, page, size),
		enabled: searchTerm.length >= 2,
		staleTime: STALE_TIME.SHORT,
		select: res => res.data,
	});

export const useGetClassroomById = (id: string) =>
	useQuery({
		queryKey: classroomsKeys.detail(id),
		queryFn: () => classroomsApi.getClassroomById(id),
		enabled: Boolean(id),
		staleTime: STALE_TIME.MEDIUM,
		select: res => res.data.data,
	});
