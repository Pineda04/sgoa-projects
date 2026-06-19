import { useMutation, useQueryClient } from '@tanstack/react-query';
import { academicPeriodsApi } from '../../api';
import { academicPeriodKeys } from '../../constants';
import { TCreateAcademicPeriodDto, TUpdateAcademicPeriodDto } from '../../types';

export const useCreateAcademicPeriod = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: TCreateAcademicPeriodDto) =>
			academicPeriodsApi.createAcademicPeriod(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: academicPeriodKeys.all });
		},
	});
};

export const useUpdateAcademicPeriod = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: TUpdateAcademicPeriodDto }) =>
			academicPeriodsApi.updateAcademicPeriod(id, data),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: academicPeriodKeys.all });
			queryClient.invalidateQueries({
				queryKey: academicPeriodKeys.detail(variables.id),
			});
		},
	});
};

export const useDeleteAcademicPeriod = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => academicPeriodsApi.deleteAcademicPeriod(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: academicPeriodKeys.all });
		},
	});
};
