import { queryClient } from "@config/lib";
import { useMutation } from "@tanstack/react-query";
import { alertSuccess } from "@shared/utils";
import { roomTypesApi, roomTypesKeys } from ".";

export const useCreateRoomType = () =>
	useMutation({
		mutationFn: (body: { description: string }) => roomTypesApi.createRoomType(body),
		onSuccess: async (res) => {
			alertSuccess(res);
			await queryClient.removeQueries({ queryKey: roomTypesKeys.all });
		},
	});

export const useUpdateRoomType = () => {
	const { mutateAsync, isPending } = useMutation({
		mutationFn: ({ id, body }: { id: string; body: { description: string } }) =>
			roomTypesApi.updateRoomType({ id, body }),
		onSuccess: async (res) => {
			alertSuccess(res);
			await queryClient.removeQueries({ queryKey: roomTypesKeys.all });
		},
	});

	return { updateRoomType: mutateAsync, isPendingUpdate: isPending };
};

export const useDeleteRoomType = () => {
	const { mutateAsync, isPending } = useMutation({
		mutationFn: (id: string) => roomTypesApi.deleteRoomType(id),
		onSuccess: async (res) => {
			alertSuccess(res);
			await queryClient.removeQueries({ queryKey: roomTypesKeys.all });
		},
	});

	return { deleteRoomType: mutateAsync, isPendingDelete: isPending };
};
