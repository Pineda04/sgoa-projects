import { useMutation, useQueryClient } from '@tanstack/react-query';
import { centersApi } from '../../api/centers.api';
import { centerKeys } from '../../constants/centerKeys';

export const useCreateCenterMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: { name: string }) => centersApi.createCenter(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: centerKeys.all });
        }
    });
};

export const useUpdateCenterMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: { name: string } }) =>
            centersApi.updateCenter(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: centerKeys.all });
            queryClient.invalidateQueries({ queryKey: centerKeys.detail(variables.id) });
        }
    });
};

export const useDeleteCenterMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => centersApi.deleteCenter(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: centerKeys.all });
        }
    });
};