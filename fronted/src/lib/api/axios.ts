import { getAccessToken } from '@features/auth/utils';
import axios, { InternalAxiosRequestConfig } from 'axios';

const noAuthEndpoints = [
	'/auth/local/signin',
	'/auth/local/signup',
	// "/auth/refresh",
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

// export const instanceFormData = axios.create({
//   baseURL: API,
//   withCredentials: true,
//   headers: {
//     "Content-Type": "multipart/form-data",
//   },
// });

const authRequestInterceptor = (config: InternalAxiosRequestConfig) => {
	// console.log(config.url);
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
// instanceFormData.interceptors.request.use(authRequestInterceptor);

// api.interceptors.response.use(
//   (response) => response,
//   // switch case o ifs
//   (error) => {
//     console.log(error);
//     return Promise.reject(error);
//   },
// );
