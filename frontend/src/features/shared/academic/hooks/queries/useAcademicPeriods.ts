import { useQuery } from '@tanstack/react-query';
import { STALE_TIME } from '@lib/tanstack/query-client';
import { academicPeriodsApi } from '../../api';
import { academicPeriodKeys } from '../../constants';

export const useGetCurrentAcademicPeriod = () =>
	useQuery({
		queryKey: academicPeriodKeys.current(),
		queryFn: academicPeriodsApi.getCurrentAcademicPeriod,
		retry: false,
		refetchOnWindowFocus: false,
		staleTime: STALE_TIME.LONG,
		select: res => res.data.data,
	});

export const useGetAcademicPeriods = () =>
	useQuery({
		queryKey: academicPeriodKeys.lists(),
		queryFn: academicPeriodsApi.getAcademicPeriods,
		retry: false,
		refetchOnWindowFocus: false,
		staleTime: STALE_TIME.LONG,
		select: res => res.data.data,
	});

export const useGetAcademicPeriodNextToCreate = () =>
	useQuery({
		queryKey: academicPeriodKeys.next(),
		queryFn: () => academicPeriodsApi.getAcademicPeriodNextToCreate(),
		retry: false,
		refetchOnWindowFocus: false,
		staleTime: STALE_TIME.LONG,
		select: res => res.data.data,
	});
