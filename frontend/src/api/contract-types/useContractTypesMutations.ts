import { queryClient } from "@config/lib";
import { useMutation } from "@tanstack/react-query";
import { alertSuccess } from "@shared/utils";
import { contractTypesApi, contractTypesKeys } from ".";

export const useCreateContractType = () =>
	useMutation({
		mutationFn: (body: { name: string }) => contractTypesApi.createContractType(body),
		onSuccess: async (res) => {
			alertSuccess(res);
			await queryClient.removeQueries({ queryKey: contractTypesKeys.all });
		},
	});

export const useUpdateContractType = () => {
	const { mutateAsync, isPending } = useMutation({
		mutationFn: ({ id, body }: { id: string; body: { name: string } }) =>
			contractTypesApi.updateContractType({ id, body }),
		onSuccess: async (res) => {
			alertSuccess(res);
			await queryClient.removeQueries({ queryKey: contractTypesKeys.all });
		},
	});

	return { updateContractType: mutateAsync, isPendingUpdate: isPending };
};

export const useDeleteContractType = () => {
	const { mutateAsync, isPending } = useMutation({
		mutationFn: (id: string) => contractTypesApi.deleteContractType(id),
		onSuccess: async (res) => {
			alertSuccess(res);
			await queryClient.removeQueries({ queryKey: contractTypesKeys.all });
		},
	});

	return { deleteContractType: mutateAsync, isPendingDelete: isPending };
};
