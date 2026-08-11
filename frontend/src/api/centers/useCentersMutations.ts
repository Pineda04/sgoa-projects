import { useMutation, useQueryClient } from '@tanstack/react-query';
import { centersApi } from './centers.api';
import { centersKeys } from './centers.keys';

export const useCreateCenterMutation = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: { name: string }) => centersApi.createCenter(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: centersKeys.all });
		},
	});
};

export const useUpdateCenterMutation = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: { name: string } }) =>
			centersApi.updateCenter(id, data),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: centersKeys.all });
			queryClient.invalidateQueries({
				queryKey: centersKeys.detail(variables.id),
			});
		},
	});
};

export const useDeleteCenterMutation = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => centersApi.deleteCenter(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: centersKeys.all });
		},
	});
};
