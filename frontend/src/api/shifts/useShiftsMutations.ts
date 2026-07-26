import { queryClient } from "@config/lib";
import { useMutation } from "@tanstack/react-query";
import { alertSuccess } from "@shared/utils";
import { shiftsApi, shiftsKeys } from ".";

export const useCreateShift = () =>
	useMutation({
		mutationFn: (body: { name: string }) => shiftsApi.createShift(body),
		onSuccess: async (res) => {
			alertSuccess(res);
			await queryClient.invalidateQueries({ queryKey: shiftsKeys.all });
		},
	});

export const useUpdateShift = () => {
	const { mutateAsync, isPending } = useMutation({
		mutationFn: ({ id, body }: { id: string; body: { name: string } }) =>
			shiftsApi.updateShift({ id, body }),
		onSuccess: async (res) => {
			alertSuccess(res);
			await queryClient.invalidateQueries({ queryKey: shiftsKeys.all });
		},
	});

	return { updateShift: mutateAsync, isPendingUpdate: isPending };
};

export const useDeleteShift = () => {
	const { mutateAsync, isPending } = useMutation({
		mutationFn: (id: string) => shiftsApi.deleteShift(id),
		onSuccess: async (res) => {
			alertSuccess(res);
			await queryClient.invalidateQueries({ queryKey: shiftsKeys.all });
		},
	});

	return { deleteShift: mutateAsync, isPendingDelete: isPending };
};
