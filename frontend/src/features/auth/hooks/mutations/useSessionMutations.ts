import { authApi } from '@features/auth/api';
import { IAuthLogin } from '@features/auth/types';
import { useMutation } from '@tanstack/react-query';

export const useLogin = () =>
	useMutation({
		mutationFn: (credentials: IAuthLogin) => authApi.login(credentials),
	});
