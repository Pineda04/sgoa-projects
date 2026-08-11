import { TCreateUser, TUpdateUser } from './users.types';
import { usersApi } from './users.api';
import { usersKeys } from './users.keys';
import { useMutation } from '@tanstack/react-query';
import { alertSuccess } from '@shared';
import { queryClient, useAuth } from '@config';
import { teachersApi, teachersKeys } from '../teachers';

// Los 'teachers' terminan siendo usuarios, por lo que es mejor segmentarlos acá
export const useCreateUser = () =>
	useMutation({
		mutationFn: (body: TCreateUser) => usersApi.createUser(body),
		onSuccess: async res => {
			alertSuccess(res);
			await queryClient.invalidateQueries({
				queryKey: teachersKeys.all,
			});

			await queryClient.invalidateQueries({
				queryKey: ['teacher', 'coordinator'],
			});
		},
	});

export const useUpdateUser = (userId: string) => {
	const {
		authState: { user },
	} = useAuth();

	const action =
		userId === user?.sub ? usersApi.updateUser : usersApi.updateUserOther;

	const { mutateAsync, isPending } = useMutation({
		mutationFn: ({ body }: { body: TUpdateUser }) =>
			action({ userId, body }),
		onSuccess: async res => {
			alertSuccess(res);

			const refetchQueries = [
				queryClient.refetchQueries({
					queryKey: usersKeys.all,
					// refetchType: 'active',
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

			if (userId === user?.sub)
				refetchQueries.push(
					queryClient.refetchQueries({
						queryKey: teachersKeys.detail(userId),
					})
				);

			await Promise.all(refetchQueries);
		},
	});

	return { updateUser: mutateAsync, isPendingUpdate: isPending };
};

export const useChangeStatusActiveStatus = () => {
	const { mutateAsync, isPending } = useMutation({
		mutationFn: (teacherId: string) =>
			teachersApi.changeStatusActiveTeacherUser(teacherId),
		onSuccess: async res => {
			alertSuccess(res);

			await Promise.all([
				queryClient.refetchQueries({
					queryKey: usersKeys.all,
				}),
				queryClient.refetchQueries({
					queryKey: teachersKeys.all,
				}),
				queryClient.refetchQueries({
					queryKey: ['teacher', 'coordinator'],
				}),
			]);
		},
	});

	return {
		changeStatusActiveUser: mutateAsync,
		isPendingChangeStatusActive: isPending,
	};
};

export const useReplaceMonitorBuildingAssignments = () =>
	useMutation({
		mutationFn: usersApi.replaceMonitorBuildings,
		onSuccess: async response => {
			await alertSuccess(response);
			await Promise.all([
				queryClient.invalidateQueries({ queryKey: usersKeys.all }),
				queryClient.invalidateQueries({ queryKey: ['monitor'] }),
				queryClient.invalidateQueries({ queryKey: ['analytics'] }),
			]);
		},
	});
