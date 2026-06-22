import { useMutation } from '@tanstack/react-query';
import { AxiosResponse } from 'axios';
import { alertSuccess, IResponse } from '@shared';
import { TPostgrad, TUndergrad } from './degrees.types';
import { degreesApi } from './degrees.api';
import { queryClient } from '@config';
import { usersKeys } from '../users';
import { teachersKeys } from '../teachers';

type MutationBody<T> = { body: T };

type ActionFn<T> = (
	args: MutationBody<T>
) => Promise<AxiosResponse<IResponse<unknown>>>;

const actions = {
	undergrad: {
		add: ({ body }: { body: TUndergrad }) =>
			degreesApi.addTeacherUndergrad({ body }),
		delete: ({ body }: { body: TUndergrad }) =>
			degreesApi.deleteTeacherUndergrad({ body }),
	},
	postgrad: {
		add: ({ body }: { body: TPostgrad }) =>
			degreesApi.addTeacherPostgrad({ body }),
		delete: ({ body }: { body: TPostgrad }) =>
			degreesApi.deleteTeacherPostgrad({ body }),
	},
};

export const useManageTeacherDegrees = <
	TBody,
	T extends keyof typeof actions,
	K extends keyof (typeof actions)[T],
>(
	userId: string,
	degree: T,
	action: K
) => {
	const { mutateAsync, isPending } = useMutation<
		AxiosResponse<IResponse<unknown>>,
		Error,
		MutationBody<TBody>
	>({
		mutationFn: (params: MutationBody<TBody>) =>
			(actions[degree][action] as ActionFn<TBody>)(params),
		onSuccess: async res => {
			alertSuccess(res);

			const refetchQueries = [
				queryClient.refetchQueries({
					queryKey: usersKeys.all,
					// refetchType: 'active',
				}),
				queryClient.refetchQueries({
					queryKey: teachersKeys.detail(userId),
				}),
				queryClient.refetchQueries({
					queryKey: teachersKeys.all,
					// refetchType: 'active',
				}),
				queryClient.refetchQueries({
					queryKey: ['teacher', 'coordinator'],
					// refetchType: 'active',
				}),
			];

			await Promise.all(refetchQueries);
		},
	});

	return {
		executeAction: mutateAsync,
		isPending,
	};
};
