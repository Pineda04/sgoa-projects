import { useMutation, useQueryClient } from '@tanstack/react-query';
import { audioEquipmentsApi } from './audio-equipments.api';
import { audioEquipmentsKeys } from './audio-equipments.keys';
import { TCreateAudioEquipment, TUpdateAudioEquipment } from './audio-equipments.types';

export const useCreateAudioEquipmentMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: TCreateAudioEquipment) => audioEquipmentsApi.createAudioEquipment(data),
       onSuccess: async () => {
            return await queryClient.invalidateQueries({ queryKey: audioEquipmentsKeys.all });
        }
    });
};

export const useUpdateAudioEquipmentMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: TUpdateAudioEquipment }) =>
            audioEquipmentsApi.updateAudioEquipment(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: audioEquipmentsKeys.all });
            queryClient.invalidateQueries({ queryKey: audioEquipmentsKeys.detail(variables.id) });
        }
    });
};

export const useDeleteAudioEquipmentMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => audioEquipmentsApi.deleteAudioEquipment(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: audioEquipmentsKeys.all });
        }
    });
};