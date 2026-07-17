import { useMutation } from '@tanstack/react-query';
import { queryClient } from '@config/lib';
import { monitorApi } from './monitor.api';
import { monitorKeys } from './monitor.keys';
import { alertSuccess } from '@shared';

export const useCreateCheckMutation = () => {
	const { mutateAsync } = useMutation({
		mutationFn: monitorApi.createScheduleCheck,
		onSuccess: async res => {
			try {
				await alertSuccess(res);
			} catch {
				// Ignore alert errors
			}

			await queryClient.invalidateQueries({
				queryKey: monitorKeys.lists(),
			});
		},
	});

	return {
		createCheck: mutateAsync,
	};
};
