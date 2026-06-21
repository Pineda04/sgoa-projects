import { useEffect, useState } from 'react';
import { AuthContext } from './AuthContext';
import { jwtDecode } from 'jwt-decode';
import {
	setAccessToken,
	removeAccessToken,
	getAccessToken,
} from '@features/auth/utils';
import { IAuthStateProps, ITokenPayload } from '@shared/interfaces';
import { authApi, IAuthLogin, useLogin } from '@api/auth';
import { IChildrenProps } from '@shared/interfaces';

const initialState: IAuthStateProps = {
	isAuthenticated: false,
	user: null,
	isLoading: true,
	errors: null as null | string[] | string,
};

const checkSessionToken = async (token: string) => {
	let decoded = jwtDecode<ITokenPayload>(token);
	const currentTime = Date.now() / 1000;

	if (decoded.exp < currentTime) {
		const { access_token } = await authApi.refreshToken();

		const newToken = jwtDecode<ITokenPayload>(access_token);

		setAccessToken(access_token);

		decoded = newToken;
	}

	return decoded;
};

export const AuthProvider = ({ children }: IChildrenProps) => {
	const [authState, setAuthState] = useState(initialState);
	const { mutateAsync: loginRequest } = useLogin();

	const login = async (userCredentials: IAuthLogin) => {
		try {
			setAuthState(prev => ({
				...prev,
				isAuthenticated: false,
				user: null,
				isLoading: true,
				errors: null,
			}));

			const { data } = await loginRequest(userCredentials);
			const info = jwtDecode<ITokenPayload>(data.data.access_token);

			setAuthState({
				isAuthenticated: true,
				user: {
					email: info.email,
					roles: Array.isArray(info.roles) ? info.roles : [],
					sub: info.sub,
				},
				isLoading: false,
				errors: null,
			});

			setAccessToken(data.data.access_token);

			return data;
		} catch (error: unknown) {
			const message =
				error && typeof error === 'object' && 'response' in error
					? (error as { response: { data: { message: string } } }).response?.data?.message
					: 'Ocurrió un error al iniciar sesión.';

			setAuthState(prev => ({
				...prev,
				isLoading: false,
				errors: message,
			}));

			throw error;
		}
	};

	const logout = async () => {
		try {
			setAuthState(prev => ({
				...prev,
				isLoading: true,
			}));

			await authApi.logout();

			setAuthState({
				...initialState,
				isLoading: false,
			});

			removeAccessToken();
		} catch (error: unknown) {
			console.log(error);
			throw error;
		}
	};

	const checkSession = async () => {
		const access_token = getAccessToken();

		try {
			if (!access_token)
				return setAuthState(prev => ({
					...prev,
					isAuthenticated: false,
					user: null,
					isLoading: false,
					errors: null,
				}));

			const info = await checkSessionToken(access_token);
			// console.log(info);

			setAuthState(prev => ({
				...prev,
				isAuthenticated: true,
				user: {
					email: info.email,
					roles: Array.isArray(info.roles) ? info.roles : [],
					sub: info.sub,
				},
				isLoading: false,
				errors: null,
			}));
		} catch {
			// console.log(error);

			setAuthState(prev => ({
				...prev,
				isLoading: false,
				errors: 'Error al verificar su sesión, ingrese de nuevo...',
			}));

			removeAccessToken();
		}
	};

	useEffect(() => {
		checkSession();
	}, []);

	const cleanErrors = (errors: null) => {
		setAuthState(prev => ({
			...prev,
			errors,
		}));
	};

	return (
		<AuthContext.Provider value={{ authState, cleanErrors, login, logout }}>
			{children}
		</AuthContext.Provider>
	);
};
