import { queryClient } from "@config/lib";
import { useMutation } from "@tanstack/react-query";
import { alertSuccess } from "@shared/utils";
import { conditionsApi, conditionsKeys } from ".";

export const useCreateCondition = () =>
	useMutation({
		mutationFn: (body: { status: string }) => conditionsApi.createCondition(body),
		onSuccess: async (res) => {
			alertSuccess(res);
			await queryClient.removeQueries({ queryKey: conditionsKeys.all });
		},
	});

export const useUpdateCondition = () => {
	const { mutateAsync, isPending } = useMutation({
		mutationFn: ({ id, body }: { id: string; body: { status: string } }) =>
			conditionsApi.updateCondition({ id, body }),
		onSuccess: async (res) => {
			alertSuccess(res);
			await queryClient.removeQueries({ queryKey: conditionsKeys.all });
		},
	});

	return { updateCondition: mutateAsync, isPendingUpdate: isPending };
};

export const useDeleteCondition = () => {
	const { mutateAsync, isPending } = useMutation({
		mutationFn: (id: string) => conditionsApi.deleteCondition(id),
		onSuccess: async (res) => {
			alertSuccess(res);
			await queryClient.removeQueries({ queryKey: conditionsKeys.all });
		},
	});

	return { deleteCondition: mutateAsync, isPendingDelete: isPending };
};
