import { useQuery } from '@tanstack/react-query';
import { STALE_TIME } from '@lib/tanstack/query-client';
import { configTeacherApi } from '../../api/config-teacher.api';
import {
	contractTypeKeys,
	teacherCategoryKeys,
	shiftKeys,
	positionKeys,
} from '../../constants/configTeacherKeys';

export const useGetAllContractTypes = () =>
	useQuery({
		queryKey: contractTypeKeys.all,
		queryFn: configTeacherApi.getAllContractTypes,
		retry: false,
		refetchOnWindowFocus: false,
		staleTime: STALE_TIME.VERY_LONG,
		select: res => res.data.data,
	});

export const useGetAllTeacherCategories = () =>
	useQuery({
		queryKey: teacherCategoryKeys.all,
		queryFn: configTeacherApi.getAllTeacherCategories,
		retry: false,
		refetchOnWindowFocus: false,
		staleTime: STALE_TIME.VERY_LONG,
		select: res => res.data.data,
	});

export const useGetAllShifts = () =>
	useQuery({
		queryKey: shiftKeys.all,
		queryFn: configTeacherApi.getAllShifts,
		retry: false,
		refetchOnWindowFocus: false,
		staleTime: STALE_TIME.VERY_LONG,
		select: res => res.data.data,
	});

export const useGetAllPositions = () =>
	useQuery({
		queryKey: positionKeys.all,
		queryFn: configTeacherApi.getAllPositions,
		retry: false,
		refetchOnWindowFocus: false,
		staleTime: STALE_TIME.VERY_LONG,
		select: res => res.data.data,
	});
