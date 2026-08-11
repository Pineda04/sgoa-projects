import { useMutation } from '@tanstack/react-query';
import { complementaryActivitiesApi } from './activities.api';
import { alertSuccess } from '@shared';
import { queryClient } from '@config/lib';
import { academicAssignmentReportsKeys } from '../assignment-reports';

export const useCreateComplementaryActivity = (reportId: string) => {
	const { mutateAsync } = useMutation({
		mutationFn: (formData: FormData) =>
			complementaryActivitiesApi.createComplementaryActivity(formData),
		onSuccess: async res => {
			try {
				await alertSuccess(res);
			} catch {
				// Ignore alert errors
			}

			await queryClient.invalidateQueries({
				queryKey: academicAssignmentReportsKeys.report(reportId),
			});
		},
	});

	return {
		addComplementaryActivity: mutateAsync,
	};
};

export const useUpdateComplementaryActivity = (reportId: string) => {
	const { mutateAsync, isPending } = useMutation({
		mutationFn: ({ id, formData }: { id: string; formData: FormData }) =>
			complementaryActivitiesApi.updateComplementaryActivity(
				id,
				formData
			),
		onSuccess: async res => {
			try {
				await alertSuccess(res);
			} catch {
				// Ignore alert errors
			}

			await queryClient.invalidateQueries({
				queryKey: academicAssignmentReportsKeys.report(reportId),
			});
		},
	});

	return {
		updateComplementaryActivity: mutateAsync,
		isPendingUpdate: isPending,
	};
};

export const useDeleteComplementaryActivity = (reportId: string) => {
	const { mutateAsync } = useMutation({
		mutationFn: (id: string) =>
			complementaryActivitiesApi.deleteComplementaryActivity(id),
		onSuccess: async res => {
			try {
				await alertSuccess(res);
			} catch {
				// Ignore alert errors
			}

			await queryClient.invalidateQueries({
				queryKey: academicAssignmentReportsKeys.report(reportId),
			});
		},
	});

	return {
		delComplementaryActivity: mutateAsync,
	};
};
