import { queryClient } from '@lib/tanstack';
import { useMutation } from '@tanstack/react-query';
import { alertSuccess } from '@utils';
import { TCreateUser } from '../../schemas';
import { usersApi } from '../../api';
import { teacherKeys } from '@features/teachers';

// Los 'teachers' terminan siendo usuarios, por lo que es mejor segmentarlos acá
export const useCreateUser = () =>
	useMutation({
		mutationFn: (body: TCreateUser) => usersApi.createUser(body),
		onSuccess: async res => {
			alertSuccess(res);
			await queryClient.invalidateQueries({
				queryKey: teacherKeys.all,
			});

			await queryClient.invalidateQueries({
				queryKey: ['teacher', 'coordinator'],
			});
		},
	});
