import { useQuery } from '@tanstack/react-query';
import { STALE_TIME } from '@lib/tanstack/query-client';
import { classroomsApi } from '../../api';
import { classroomKeys } from '../../constants';

export const useGetClassroomsBySearchTerm = (
	searchTerm: string,
	page: number = 1,
	size: number = 50
) =>
	useQuery({
		queryKey: classroomKeys.search(searchTerm, page),
		queryFn: () =>
			classroomsApi.getClassroomsBySearchTerm(searchTerm, page, size),
		enabled: searchTerm.length >= 2,
		staleTime: STALE_TIME.SHORT,
		select: res => res.data,
	});
