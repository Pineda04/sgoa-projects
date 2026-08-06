import { queryClient } from '@config/lib';
import { useMutation } from '@tanstack/react-query';
import { alertSuccess } from '@shared/utils';
import { TCreatePosition, TUpdatePosition } from '@features/admin';
import { positionsApi, positionsKeys, TOutputPosition } from './';

type TPositionsCache = Awaited<
	ReturnType<typeof positionsApi.getAllPositionsForTable>
>;

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

            if (created && previous) {
                queryClient.setQueryData<TPositionsCache>(positionsKeys.all, {
                        ...previous,
                        data: {
							...previous.data,
							data: [created, ...previous.data.data],
						},
                    });
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

            if (previous) {
                queryClient.setQueryData<TPositionsCache>(positionsKeys.all, {
                    ...previous,
                    data: {
						...previous.data,
						data: previous.data.data.filter(position => position.id !== id),
					},
                });
            }

            return { previous };
        },
        onError: (_err, _id, context) => {
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
