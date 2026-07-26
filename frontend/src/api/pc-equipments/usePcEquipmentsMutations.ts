import { useMutation } from '@tanstack/react-query';
import { queryClient } from '@config/lib';
import { alertSuccess } from '@shared';
import {
	pcEquipmentsApi,
	pcTypesApi,
	monitorTypesApi,
	monitorSizesApi,
} from './pc-equipments.api';
import {
	pcEquipmentsKeys,
	pcTypesKeys,
	monitorTypesKeys,
	monitorSizesKeys,
} from './pc-equipments.keys';
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

export const useCreatePcType = () =>
	useMutation({
		mutationFn: (body: { description: string }) =>
			pcTypesApi.createPcType(body),
		onSuccess: async res => {
			alertSuccess(res);
			await queryClient.removeQueries({
				queryKey: pcTypesKeys.all,
			});
		},
	});

export const useUpdatePcType = () => {
	const { mutateAsync, isPending } = useMutation({
		mutationFn: ({
			id,
			body,
		}: {
			id: string;
			body: { description: string };
		}) => pcTypesApi.updatePcType({ id, body }),
		onSuccess: async res => {
			alertSuccess(res);
			await queryClient.removeQueries({
				queryKey: pcTypesKeys.all,
			});
		},
	});
	return { updatePcType: mutateAsync, isPendingUpdate: isPending };
};

export const useDeletePcType = () => {
	const { mutateAsync, isPending } = useMutation({
		mutationFn: (id: string) => pcTypesApi.deletePcType(id),
		onSuccess: async res => {
			alertSuccess(res);
			await queryClient.removeQueries({
				queryKey: pcTypesKeys.all,
			});
		},
	});
	return { deletePcType: mutateAsync, isPendingDelete: isPending };
};

export const useCreateMonitorType = () =>
	useMutation({
		mutationFn: (body: { description: string }) =>
			monitorTypesApi.createMonitorType(body),
		onSuccess: async res => {
			alertSuccess(res);
			await queryClient.removeQueries({
				queryKey: monitorTypesKeys.all,
			});
		},
	});

export const useUpdateMonitorType = () => {
	const { mutateAsync, isPending } = useMutation({
		mutationFn: ({
			id,
			body,
		}: {
			id: string;
			body: { description: string };
		}) => monitorTypesApi.updateMonitorType({ id, body }),
		onSuccess: async res => {
			alertSuccess(res);
			await queryClient.removeQueries({
				queryKey: monitorTypesKeys.all,
			});
		},
	});
	return { updateMonitorType: mutateAsync, isPendingUpdate: isPending };
};

export const useDeleteMonitorType = () => {
	const { mutateAsync, isPending } = useMutation({
		mutationFn: (id: string) => monitorTypesApi.deleteMonitorType(id),
		onSuccess: async res => {
			alertSuccess(res);
			await queryClient.removeQueries({
				queryKey: monitorTypesKeys.all,
			});
		},
	});
	return { deleteMonitorType: mutateAsync, isPendingDelete: isPending };
};

export const useCreateMonitorSize = () =>
	useMutation({
		mutationFn: (body: { description: string }) =>
			monitorSizesApi.createMonitorSize(body),
		onSuccess: async res => {
			alertSuccess(res);
			await queryClient.removeQueries({
				queryKey: monitorSizesKeys.all,
			});
		},
	});

export const useUpdateMonitorSize = () => {
	const { mutateAsync, isPending } = useMutation({
		mutationFn: ({
			id,
			body,
		}: {
			id: string;
			body: { description: string };
		}) => monitorSizesApi.updateMonitorSize({ id, body }),
		onSuccess: async res => {
			alertSuccess(res);
			await queryClient.removeQueries({
				queryKey: monitorSizesKeys.all,
			});
		},
	});
	return { updateMonitorSize: mutateAsync, isPendingUpdate: isPending };
};

export const useDeleteMonitorSize = () => {
	const { mutateAsync, isPending } = useMutation({
		mutationFn: (id: string) => monitorSizesApi.deleteMonitorSize(id),
		onSuccess: async res => {
			alertSuccess(res);
			await queryClient.removeQueries({
				queryKey: monitorSizesKeys.all,
			});
		},
	});
	return { deleteMonitorSize: mutateAsync, isPendingDelete: isPending };
};
