import { useMutation } from '@tanstack/react-query';
import { queryClient } from '@config/lib';
import { useAuth } from '@config/providers';
import { monitorApi } from './monitor.api';
import { monitorKeys } from './monitor.keys';
import { alertSuccess } from '@shared';

export const useCreateCheckMutation = () => {
	const sessionEmail = useAuth().authState.user?.email;
	const { mutateAsync, isPending } = useMutation({
		mutationFn: monitorApi.createCheck,
		onSuccess: async res => {
			try {
				await alertSuccess(res);
			} catch {
				// Ignore alert errors
			}

			await queryClient.invalidateQueries({
				queryKey: monitorKeys.currentAssignments(sessionEmail),
			});
		},
	});

	return {
		createCheck: mutateAsync,
		isPendingCreateCheck: isPending,
	};
};

export const useUpdateCheckMutation = () => {
	const { mutateAsync, isPending } = useMutation({
		mutationFn: monitorApi.updateCheck,
		onSuccess: async res => {
			try {
				await alertSuccess(res);
			} catch {
				// Ignore alert errors
			}

			await queryClient.invalidateQueries({
				queryKey: monitorKeys.all,
			});
		},
	});

	return {
		updateCheck: mutateAsync,
		isPendingUpdateCheck: isPending,
	};
};
