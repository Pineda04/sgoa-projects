import { useMutation, useQueryClient } from '@tanstack/react-query';
import { buildingsApi } from './buildings.api';
import { buildingsKeys } from './buildings.keys';
import { TCreateBuilding, TUpdateBuilding } from './buildings.types';

export const useCreateBuildingMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: TCreateBuilding) => buildingsApi.createBuilding(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: buildingsKeys.all });
        }
    });
};

export const useUpdateBuildingMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: TUpdateBuilding }) =>
            buildingsApi.updateBuilding(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: buildingsKeys.all });
            queryClient.invalidateQueries({ queryKey: buildingsKeys.detail(variables.id) });
        }
    });
};

export const useDeleteBuildingMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => buildingsApi.deleteBuilding(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: buildingsKeys.all });
        }
    });
};