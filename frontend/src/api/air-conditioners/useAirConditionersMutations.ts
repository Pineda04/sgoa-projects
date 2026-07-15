import { useMutation } from '@tanstack/react-query';
import { queryClient } from '@config/lib';
import { alertSuccess } from '@shared';
import { airConditionersApi } from './air-conditioners.api';
import { airConditionersKeys } from './air-conditioners.keys';
import {
	TCreateAirConditioner,
	TUpdateAirConditioner,
} from './air-conditioners.types';

export const useCreateAirConditioner = () =>
	useMutation({
		mutationFn: (body: TCreateAirConditioner) =>
			airConditionersApi.createAirConditioner(body),
		onSuccess: async res => {

			await Promise.all([
				queryClient.removeQueries({ queryKey: airConditionersKeys.all }),
				queryClient.removeQueries({ queryKey: airConditionersKeys.list() }),
			]);
			alertSuccess(res);
		},
	});

export const useUpdateAirConditioner = () => {
	const { mutateAsync, isPending } = useMutation({
		mutationFn: ({
			id,
			body,
		}: {
			id: string;
			body: TUpdateAirConditioner;
		}) => airConditionersApi.updateAirConditioner({ id, body }),
		onSuccess: async res => {

			await Promise.all([
				queryClient.invalidateQueries({ queryKey: airConditionersKeys.list() }),
				queryClient.invalidateQueries({ queryKey: airConditionersKeys.all }),
			]);
			alertSuccess(res);
		},
	});
	return { updateAirConditioner: mutateAsync, isPendingUpdate: isPending };
};

export const useDeleteAirConditioner = () => {
	const { mutateAsync, isPending } = useMutation({
		mutationFn: (id: string) =>
			airConditionersApi.deleteAirConditioner(id),
		onSuccess: async res => {

			await Promise.all([
				queryClient.invalidateQueries({ queryKey: airConditionersKeys.list() }),
				queryClient.invalidateQueries({ queryKey: airConditionersKeys.all }),
			]);
			alertSuccess(res);
		},
	});
	return { deleteAirConditioner: mutateAsync, isPendingDelete: isPending };
};
