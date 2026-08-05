import { queryClient } from '@config/lib';
import { useMutation } from '@tanstack/react-query';
import { alertSuccess } from '@shared/utils';
import { TCreatePosition, TUpdatePosition } from '@features/admin';
import { positionsApi, positionsKeys, TOutputPosition } from './';

type TPositionsCache =
    | TOutputPosition[]
    | { data: TOutputPosition[] }
    | undefined;

export const useCreatePosition = () =>
    useMutation({
        mutationFn: (body: TCreatePosition) => positionsApi.createPosition(body),
        onError: (error) => {
            console.error(error);
        },
        onSuccess: async res => {
            alertSuccess(res);
            const created: TOutputPosition | undefined = res?.data?.data;
            const previous = queryClient.getQueryData<TPositionsCache>(positionsKeys.all);

            if (created) {
                if (Array.isArray(previous)) {
                    queryClient.setQueryData(positionsKeys.all, [created, ...previous]);
                } else if (previous && typeof previous === 'object' && Array.isArray(previous.data)) {
                    queryClient.setQueryData(positionsKeys.all, {
                        ...previous,
                        data: [created, ...previous.data],
                    });
                }
            }

            await Promise.all([
                queryClient.invalidateQueries({ queryKey: positionsKeys.all }),
            ]);
        },
    });

export const useUpdatePosition = (positionId: string) => {
    const { mutateAsync, isPending } = useMutation({
        mutationFn: (body: TUpdatePosition) => 
            positionsApi.updatePosition({ id: positionId, body }),
        onError: (error) => {
            console.error(error);
        },
        onSuccess: async res => {
            alertSuccess(res);
                await Promise.all([
                    queryClient.invalidateQueries({ queryKey: positionsKeys.all }),
                    queryClient.invalidateQueries({
                        queryKey: positionsKeys.detail(positionId),
                    }),
                ]);
        },
    });

    return { updatePosition: mutateAsync, isPendingUpdate: isPending };
};

export const useDeletePositionMutation = (positionId: string) => {
    const { mutateAsync, isPending } = useMutation({
        mutationFn: (id: string) => positionsApi.deletePosition(id),
        // Optimistic update: remove item from cache immediately and rollback on error
        onMutate: async (id: string) => {
            await queryClient.cancelQueries({ queryKey: positionsKeys.all });
            const previous = queryClient.getQueryData<TPositionsCache>(positionsKeys.all);

            // If cache is an array of positions
            if (Array.isArray(previous)) {
                queryClient.setQueryData<TOutputPosition[] | undefined>(
                    positionsKeys.all,
                    previous.filter((p: TOutputPosition) => p.id !== id)
                );
            } else if (previous && typeof previous === 'object' && Array.isArray(previous.data)) {
                // If cache shape is { data: [...] }
                queryClient.setQueryData(positionsKeys.all, {
                    ...previous,
                    data: previous.data.filter((p: TOutputPosition) => p.id !== id),
                });
            } // else: unknown shape, do nothing

            return { previous } as { previous?: TPositionsCache };
        },
        onError: (_err, _id, context: { previous?: TPositionsCache }) => {
            if (context?.previous) {
                queryClient.setQueryData(positionsKeys.all, context.previous);
            }
        },
        onSuccess: async res => {
            alertSuccess(res);
        },
        onSettled: async () => {
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: positionsKeys.all }),
                queryClient.invalidateQueries({
                    queryKey: positionsKeys.detail(positionId),
                }),
            ]);
        },
    });

    return { deletePosition: mutateAsync, isPendingDelete: isPending };
};