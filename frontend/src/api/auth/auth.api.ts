import { api } from '@config/lib';
import { IAuthLogin, ITokens } from './auth.interfaces';
import { TForgotPassword, TResetPasswordWithToken } from './auth.types';
import { IResponse } from '@shared/interfaces';

export const authApi = {
	login: async (user: IAuthLogin) => {
		return await api.post<IResponse<ITokens>>(`/auth/local/signin`, user);
	},

	logout: () => api.post(`/auth/logout`),

	refreshToken: async () => {
		const { data } = await api.post<IResponse<ITokens>>(`/auth/refresh`);

		if (data.statusCode >= 400)
			throw new Error('Error al refrescar token.');

		return data.data;
	},

	forgotPassword: (body: TForgotPassword) =>
		api.post<IResponse<[]>>(`/auth/forgot-password`, body),

	resetPassword: (body: TResetPasswordWithToken) =>
		api.post<IResponse<[]>>(`/auth/reset-password`, body),
};
