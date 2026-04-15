import { api } from '@lib/api/axios';
import { ITokenPayload } from '@types';
import { jwtDecode } from 'jwt-decode';

export const setAccessToken = (token: string): void => {
	localStorage.setItem('access_token', token);
};

export const getAccessToken = (): string | null => {
	return typeof localStorage === 'object'
		? localStorage.getItem('access_token')
		: null;
};

export const removeAccessToken = (): void => {
	if (getAccessToken() != null) localStorage.removeItem('access_token');
};

export const removeRefreshToken = async (): Promise<void> => {
	await api.post('/auth/logout');
};

export const jwtDecoded = (token: string) => jwtDecode<ITokenPayload>(token);
