import { authApi } from '@features/auth/api';
import {
	TForgotPassword,
	TResetPasswordWithToken,
} from '@features/auth/schemas';
import { useMutation } from '@tanstack/react-query';
import { genericAlert } from '@utils';

export const useResetPassword = () =>
	useMutation({
		mutationFn: (body: TResetPasswordWithToken) =>
			authApi.resetPassword(body),
		onSuccess: () => genericAlert('Se ha cambiado su contraseña.'),
	});

export const useForgotPassword = () =>
	useMutation({
		mutationFn: (body: TForgotPassword) => authApi.forgotPassword(body),
		onSuccess: () =>
			genericAlert('Si el usuario existe, pronto recibirá un correo.'),
	});
