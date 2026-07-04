import { useMutation } from '@tanstack/react-query';
import { queryClient } from '@config/lib';
import { alertSuccess } from '@shared';
import { pcEquipmentsApi } from './pc-equipments.api';
import { pcEquipmentsKeys } from './pc-equipments.keys';
import {
	TCreatePcEquipment,
	TUpdatePcEquipment,
} from './pc-equipments.types';

export const useCreatePcEquipment = () =>
	useMutation({
		mutationFn: (body: TCreatePcEquipment) =>
			pcEquipmentsApi.createPcEquipment(body),
		onSuccess: async res => {
			alertSuccess(res);
			await queryClient.invalidateQueries({
				queryKey: pcEquipmentsKeys.all,
			});
		},
	});

export const useUpdatePcEquipment = () => {
	const { mutateAsync, isPending } = useMutation({
		mutationFn: ({ id, body }: { id: string; body: TUpdatePcEquipment }) =>
			pcEquipmentsApi.updatePcEquipment({ id, body }),
		onSuccess: async res => {
			alertSuccess(res);
			await queryClient.invalidateQueries({
				queryKey: pcEquipmentsKeys.all,
			});
		},
	});
	return { updatePcEquipment: mutateAsync, isPendingUpdate: isPending };
};

export const useDeletePcEquipment = () => {
	const { mutateAsync, isPending } = useMutation({
		mutationFn: (id: string) => pcEquipmentsApi.deletePcEquipment(id),
		onSuccess: async res => {
			alertSuccess(res);
			await queryClient.invalidateQueries({
				queryKey: pcEquipmentsKeys.all,
			});
		},
	});
	return { deletePcEquipment: mutateAsync, isPendingDelete: isPending };
};
