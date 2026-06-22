import { getAccessToken } from '@features/auth/utils';
import axios, { InternalAxiosRequestConfig } from 'axios';

const noAuthEndpoints = [
	'/auth/local/signin',
	'/auth/local/signup',
];

const API =
	import.meta.env.VITE_API_BASE_URL ??
	`http://${window.location.hostname}:3050/api/v1`;

export const api = axios.create({
	baseURL: API,
	withCredentials: true,
	headers: {
		'Content-Type': 'application/json',
	},
});

const authRequestInterceptor = (config: InternalAxiosRequestConfig) => {
	if (!noAuthEndpoints.some(url => config.url?.includes(url))) {
		const token = getAccessToken();

		if (token) {
			config.headers['Authorization'] = `Bearer ${token}`;
		}
	}

	config.withCredentials = true;

	return config;
};

api.interceptors.request.use(authRequestInterceptor);
