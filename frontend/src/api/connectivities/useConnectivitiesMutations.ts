import { queryClient } from '@config/lib';
import { useMutation } from '@tanstack/react-query';
import { alertSuccess } from '@shared/utils';
import { connectivitiesApi, connectivitiesKeys } from '.';

export const useCreateConnectivity = () =>
	useMutation({
		mutationFn: (body: { description: string }) =>
			connectivitiesApi.createConnectivity(body),
		onSuccess: async res => {
			alertSuccess(res);
			await queryClient.removeQueries({
				queryKey: connectivitiesKeys.all,
			});
		},
	});

export const useUpdateConnectivity = () => {
	const { mutateAsync, isPending } = useMutation({
		mutationFn: ({
			id,
			body,
		}: {
			id: string;
			body: { description: string };
		}) => connectivitiesApi.updateConnectivity({ id, body }),
		onSuccess: async res => {
			alertSuccess(res);
			await queryClient.removeQueries({
				queryKey: connectivitiesKeys.all,
			});
		},
	});

	return { updateConnectivity: mutateAsync, isPendingUpdate: isPending };
};

export const useDeleteConnectivity = () => {
	const { mutateAsync, isPending } = useMutation({
		mutationFn: (id: string) => connectivitiesApi.deleteConnectivity(id),
		onSuccess: async res => {
			alertSuccess(res);
			await queryClient.removeQueries({
				queryKey: connectivitiesKeys.all,
			});
		},
	});

	return { deleteConnectivity: mutateAsync, isPendingDelete: isPending };
};
