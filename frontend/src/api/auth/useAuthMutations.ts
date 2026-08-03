import { useMutation } from '@tanstack/react-query';
import { authApi } from './auth.api';
import { TForgotPassword, TResetPasswordWithToken } from './auth.types';
import { IAuthLogin } from './auth.interfaces';
import { genericAlert } from '@shared';

export const useLogin = () =>
	useMutation({
		mutationFn: (credentials: IAuthLogin) => authApi.login(credentials),
		// Fix: 'always' hace que el login falle rápido (error de red) en lugar de quedar pausado
		// indefinidamente con el Loading (networkMode 'online' pausa la mutación sin internet).
		networkMode: 'always',
	});

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
