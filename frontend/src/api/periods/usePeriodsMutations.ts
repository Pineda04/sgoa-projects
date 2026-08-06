import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
	TCreateAcademicPeriodDto,
	TUpdateAcademicPeriodDto,
} from './periods.types';
import { academicPeriodsApi } from './periods.api';
import { academicPeriodsKeys } from './periods.keys';

export const useCreateAcademicPeriod = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: TCreateAcademicPeriodDto) =>
			academicPeriodsApi.createAcademicPeriod(data),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: academicPeriodsKeys.all,
			});
		},
	});
};

export const useUpdateAcademicPeriod = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			id,
			data,
		}: {
			id: string;
			data: TUpdateAcademicPeriodDto;
		}) => academicPeriodsApi.updateAcademicPeriod(id, data),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({
				queryKey: academicPeriodsKeys.all,
			});
			queryClient.invalidateQueries({
				queryKey: academicPeriodsKeys.detail(variables.id),
			});
		},
	});
};

export const useDeleteAcademicPeriod = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => academicPeriodsApi.deleteAcademicPeriod(id),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: academicPeriodsKeys.all,
			});
		},
	});
};
