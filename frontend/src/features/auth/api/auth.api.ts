import { IResponse } from '@types';
import { IAuthLogin, ITokens } from '../types';
import { api } from '@lib/api/axios';
import { TForgotPassword, TResetPasswordWithToken } from '../schemas';

export const authApi = {
	login: async (user: IAuthLogin) => {
		// const { data } = await api.post<ITokens>(`/auth/local/signin`, user);

		// return data;
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
