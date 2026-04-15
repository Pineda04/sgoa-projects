import { useMutation } from '@tanstack/react-query';
import { usersApi } from '../../api';
import { alertSuccess } from '@utils';
import { queryClient } from '@lib/tanstack';
import { teacherKeys } from '@features/teachers';
import { TUpdateUser } from '../../schemas';
import { useAuth } from '@providers/auth';
import { userKeys } from '../../constants';

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
					queryKey: userKeys.all,
					// refetchType: 'active',
				}),
				queryClient.refetchQueries({
					queryKey: teacherKeys.all,
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
						queryKey: teacherKeys.detail(userId),
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
			usersApi.changeStatusActiveUser(teacherId),
		onSuccess: async res => {
			alertSuccess(res);

			await Promise.all([
				queryClient.refetchQueries({
					queryKey: userKeys.all,
				}),
				queryClient.refetchQueries({
					queryKey: teacherKeys.all,
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
