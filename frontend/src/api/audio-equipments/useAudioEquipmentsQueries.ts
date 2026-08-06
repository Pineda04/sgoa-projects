import { useQuery } from '@tanstack/react-query';
import { audioEquipmentsKeys } from './audio-equipments.keys';
import { audioEquipmentsApi } from './audio-equipments.api';

export const useGetAllAudioEquipments = () => {
	return useQuery({
		queryKey: audioEquipmentsKeys.lists(),
		queryFn: async () => {
			const response = await audioEquipmentsApi.getAllAudioEquipments();
			return response.data.data;
		},
	});
};

export const useGetAudioEquipmentById = (id: string) => {
	return useQuery({
		queryKey: audioEquipmentsKeys.detail(id),
		queryFn: async () => {
			const response = await audioEquipmentsApi.getAudioEquipmentById(id);
			return response.data.data;
		},
		enabled: !!id,
	});
};
