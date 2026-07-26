import { queryClient } from "@config/lib";
import { useMutation } from "@tanstack/react-query";
import { alertSuccess } from "@shared/utils";
import { brandsApi, brandsKeys } from ".";

export const useCreateBrand = () =>
	useMutation({
		mutationFn: (body: { name: string }) => brandsApi.createBrand(body),
		onSuccess: async (res) => {
			alertSuccess(res);
			await queryClient.invalidateQueries({ queryKey: brandsKeys.all });
		},
	});

export const useUpdateBrand = () => {
	const { mutateAsync, isPending } = useMutation({
		mutationFn: ({ id, body }: { id: string; body: { name: string } }) =>
			brandsApi.updateBrand({ id, body }),
		onSuccess: async (res) => {
			alertSuccess(res);
			await queryClient.invalidateQueries({ queryKey: brandsKeys.all });
		},
	});

	return { updateBrand: mutateAsync, isPendingUpdate: isPending };
};

export const useDeleteBrand = () => {
	const { mutateAsync, isPending } = useMutation({
		mutationFn: (id: string) => brandsApi.deleteBrand(id),
		onSuccess: async (res) => {
			alertSuccess(res);
			await queryClient.invalidateQueries({ queryKey: brandsKeys.all });
		},
	});

	return { deleteBrand: mutateAsync, isPendingDelete: isPending };
};
