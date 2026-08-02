import { useQuery } from '@tanstack/react-query';
import { academicPeriodsApi } from './periods.api';
import { academicPeriodsKeys } from './periods.keys';
import { STALE_TIME } from '@config';

export const useGetCurrentAcademicPeriod = () =>
	useQuery({
		queryKey: academicPeriodsKeys.current(),
		queryFn: academicPeriodsApi.getCurrentAcademicPeriod,
		retry: false,
		refetchOnWindowFocus: false,
		staleTime: STALE_TIME.LONG,
		select: res => res.data.data,
	});

export const useGetAcademicPeriods = (year?: string, pac?: string, modality?: string) =>
	useQuery({
		queryKey: academicPeriodsKeys.lists(year, pac, modality),
		queryFn: () => academicPeriodsApi.getAcademicPeriods(year, pac, modality),
		retry: false,
		refetchOnWindowFocus: false,
		staleTime: STALE_TIME.LONG,
		select: res => res.data.data,
	});

export const useGetAcademicPeriodNextToCreate = () =>
	useQuery({
		queryKey: academicPeriodsKeys.next(),
		queryFn: () => academicPeriodsApi.getAcademicPeriodNextToCreate(),
		retry: false,
		refetchOnWindowFocus: false,
		staleTime: STALE_TIME.LONG,
		select: res => res.data.data,
	});
