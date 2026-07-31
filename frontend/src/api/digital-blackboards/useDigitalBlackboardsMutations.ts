import { useMutation } from '@tanstack/react-query';
import { queryClient } from '@config/lib';
import { alertSuccess } from '@shared';
import { digitalBlackboardsApi } from './digital-blackboards.api';
import { digitalBlackboardsKeys } from './digital-blackboards.keys';
import {
	TCreateDigitalBlackboard,
	TUpdateDigitalBlackboard,
} from './digital-blackboards.types';

export const useCreateDigitalBlackboard = () =>
	useMutation({
		mutationFn: (body: TCreateDigitalBlackboard) =>
			digitalBlackboardsApi.createDigitalBlackboard(body),
		onSuccess: async res => {
			alertSuccess(res);
			await queryClient.invalidateQueries({
				queryKey: digitalBlackboardsKeys.all,
			});
		},
	});

export const useUpdateDigitalBlackboard = () => {
	const { mutateAsync, isPending } = useMutation({
		mutationFn: ({
			id,
			body,
		}: {
			id: string;
			body: TUpdateDigitalBlackboard;
		}) => digitalBlackboardsApi.updateDigitalBlackboard({ id, body }),
		onSuccess: async res => {
			alertSuccess(res);
			await queryClient.invalidateQueries({
				queryKey: digitalBlackboardsKeys.all,
			});
		},
	});
	return { updateDigitalBlackboard: mutateAsync, isPendingUpdate: isPending };
};

export const useDeleteDigitalBlackboard = () => {
	const { mutateAsync, isPending } = useMutation({
		mutationFn: (id: string) =>
			digitalBlackboardsApi.deleteDigitalBlackboard(id),
		onSuccess: async res => {
			alertSuccess(res);
			await queryClient.invalidateQueries({
				queryKey: digitalBlackboardsKeys.all,
			});
		},
	});
	return { deleteDigitalBlackboard: mutateAsync, isPendingDelete: isPending };
};
