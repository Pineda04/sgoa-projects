import { useEffect, useRef, useState } from 'react';
import { AuthContext } from './AuthContext';
import { jwtDecode } from 'jwt-decode';
import {
	IAuthStateProps,
	IChildrenProps,
	IResponse,
	ITokenPayload,
	IUser,
} from '@shared/interfaces';
import { authApi, IAuthLogin, ITokens, useLogin } from '@api/auth';
import {
	getAccessToken,
	removeAccessToken,
	setAccessToken,
} from '@features/auth';
import {
	queryClient,
	db,
	saveCredentials,
	verifyCredentials,
	clearOtherMonitorsCache,
	cleanupSyncedChecks,
} from '@config/lib';
import { askConfirm } from '@shared/utils';
import { clear as clearIdb } from 'idb-keyval';
import { isAxiosError } from 'axios';

const initialState: IAuthStateProps = {
	isAuthenticated: false,
	user: null,
	isLoading: true,
	errors: null as null | string[] | string,
};

// Feature: mensaje cuando no hay red y no existen credenciales locales válidas.
const OFFLINE_NO_CREDENTIALS_MESSAGE =
	'Sin conexión: no hay credenciales guardadas válidas para este usuario en este dispositivo.';

// El modo offline pertenece al checklist de monitoreo, así que se decide por
// permiso y no por nombre de rol: cualquier rol dinámico que pueda registrar
// verificaciones lo habilita.
const canCheckOffline = (
	user?: Pick<IUser, 'permissions' | 'isSuperAdmin'> | null
) =>
	!!user?.isSuperAdmin ||
	(user?.permissions ?? []).some(
		p =>
			p === 'manage:schedule-compliance-check' ||
			p === 'create:schedule-compliance-check'
	);

const checkSessionToken = async (token: string) => {
	let decoded = jwtDecode<ITokenPayload>(token);
	const currentTime = Date.now() / 1000;

	//Si no hay internet y puede registrar verificaciones, omitir el refresh y usar el token cacheado
	if (!navigator.onLine && canCheckOffline(decoded)) {
		if (decoded.exp < currentTime) {
			throw new Error(
				'La autorización offline expiró. Conéctate para renovarla.'
			);
		}
		return decoded;
	}

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
	const effectChangeFetch = useRef(false);
	const { mutateAsync: loginRequest } = useLogin();

	// Feature: restaura una sesión offline (solo MONITOR) a partir del token descifrado
	// desde IndexedDB. Devuelve un objeto compatible con IResponse<ITokens> para que el
	// Login.tsx continúe navegando; retorna null si el token no es de un monitor.
	const buildLocalSessionResponse = (
		accessToken: string
	): IResponse<ITokens> | null => {
		const info = jwtDecode<ITokenPayload>(accessToken);
		const currentTime = Date.now() / 1000;

		if (!canCheckOffline(info) || info.exp < currentTime) return null;

		queryClient.clear();
		void clearIdb();

		setAuthState({
			isAuthenticated: true,
			user: {
				email: info.email,
				roles: info.roles ?? [],
				// Sin estos dos, CASL arrancaría sin permisos y el checklist
				// offline se vería vacío.
				permissions: info.permissions ?? [],
				isSuperAdmin: info.isSuperAdmin ?? false,
				sub: info.sub,
			},
			isLoading: false,
			errors: null,
		});

		setAccessToken(accessToken);

		// Feature: dejar solo la caché local (asignaciones/período) de este monitor.
		void clearOtherMonitorsCache(info.email).catch(err =>
			console.error(
				'No se pudo limpiar la caché de otros monitores:',
				err
			)
		);
		// Política de retención: descartar checks SYNCED antiguos del monitor.
		void cleanupSyncedChecks(info.email).catch(err =>
			console.error(
				'No se pudo limpiar los checks sincronizados antiguos:',
				err
			)
		);

		return {
			status: true,
			statusCode: 200,
			path: '/auth/local/signin',
			message: 'Sesión restaurada localmente.',
			data: { access_token: accessToken, refresh_token: '' },
			timestamp: new Date().toISOString(),
		};
	};

	const login = async (userCredentials: IAuthLogin) => {
		setAuthState(prev => ({
			...prev,
			isAuthenticated: false,
			user: null,
			isLoading: true,
			errors: null,
		}));

		// Feature: sin red no se hace POST; se valida contra las credenciales cifradas en
		// IndexedDB (Dexie) que se guardaron en un login online previo. Solo rol MONITOR.
		if (!navigator.onLine) {
			const restoredToken = await verifyCredentials(userCredentials);

			if (restoredToken) {
				const response = buildLocalSessionResponse(restoredToken);
				if (response) return response;
			}

			setAuthState(prev => ({
				...prev,
				isLoading: false,
				errors: OFFLINE_NO_CREDENTIALS_MESSAGE,
			}));

			throw new Error(OFFLINE_NO_CREDENTIALS_MESSAGE);
		}

		try {
			const { data } = await loginRequest(userCredentials);
			const info = jwtDecode<ITokenPayload>(data.data.access_token);

			queryClient.clear();
			await clearIdb();

			setAuthState({
				isAuthenticated: true,
				user: {
					email: info.email,
					roles: Array.isArray(info.roles) ? info.roles : [],
					permissions: Array.isArray(info.permissions)
						? info.permissions
						: [],
					isSuperAdmin: !!info.isSuperAdmin,
					sub: info.sub,
				},
				isLoading: false,
				errors: null,
			});

			setAccessToken(data.data.access_token);

			// Feature: guardar credenciales cifradas para habilitar el login offline posterior.
			// Se hace en segundo plano: no debe bloquear el login si el guardado fallara.
			if (canCheckOffline(info)) {
				void saveCredentials({
					email: userCredentials.email,
					password: userCredentials.password,
					accessToken: data.data.access_token,
				}).catch(err =>
					console.error(
						'No se pudieron guardar las credenciales locales:',
						err
					)
				);
			} else {
				void db.credentials.delete(userCredentials.email.toLowerCase());
			}

			// Feature: descartar la caché local de otros monitores del dispositivo.
			void clearOtherMonitorsCache(userCredentials.email).catch(err =>
				console.error(
					'No se pudo limpiar la caché de otros monitores:',
					err
				)
			);
			// Política de retención: descartar checks SYNCED antiguos del monitor.
			void cleanupSyncedChecks(userCredentials.email).catch(err =>
				console.error(
					'No se pudo limpiar los checks sincronizados antiguos:',
					err
				)
			);

			return data;
		} catch (error) {
			// Feature: con "red" según el navegador pero sin conectividad real (error de red),
			// se intenta validar contra las credenciales locales antes de mostrar el error.
			const isNetworkError =
				isAxiosError(error) && error.code === 'ERR_NETWORK';

			if (isNetworkError) {
				const restoredToken = await verifyCredentials(userCredentials);

				if (restoredToken) {
					const response = buildLocalSessionResponse(restoredToken);
					if (response) return response;
				}
			}

			// Fix: los errores de red (AxiosError sin response) hacían que el mensaje quedara en
			// undefined y no se mostrara el toast. Ahora siempre cae en el mensaje por defecto.
			const message = isAxiosError<{ message?: string }>(error)
				? (error.response?.data?.message ??
					'Ocurrió un error al iniciar sesión.')
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
			//Prevenir pérdida de datos si hay checks sin sincronizar
			const currentUser = authState.user;
			if (currentUser && canCheckOffline(currentUser)) {
				const email = currentUser.email;

				const pendingCount = await db.offlineChecks
					.where('[email+syncStatus]')
					.equals([email, 'PENDING'])
					.count();

				if (pendingCount > 0) {
					const confirmLogout = await askConfirm(
						`Tienes ${pendingCount} reporte(s) sin sincronizar. Si cierras sesión ahora, SE PERDERÁN PARA SIEMPRE. ¿Estás seguro de que deseas continuar?`,
						'Cerrar sesión'
					);
					if (!confirmLogout) return; // Abortar cierre de sesión
				}

				// Limpiar los registros locales del usuario al salir
				await db.offlineChecks.where('email').equals(email).delete();
			}

			setAuthState(prev => ({
				...prev,
				isLoading: true,
			}));

			// Intentar llamar al backend (puede fallar si no hay internet)
			if (navigator.onLine) {
				try {
					await authApi.logout();
				} catch (e) {
					console.warn('Fallo al notificar logout al servidor', e);
				}
			}

			queryClient.clear();
			await clearIdb();

			setAuthState({
				...initialState,
				isLoading: false,
			});

			removeAccessToken();
		} catch (error) {
			console.log(error);
			setAuthState({
				...initialState,
				isLoading: false,
			});
			removeAccessToken();
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
			console.log(info);

			setAuthState(prev => ({
				...prev,
				isAuthenticated: true,
				user: {
					email: info.email,
					roles: Array.isArray(info.roles) ? info.roles : [],
					permissions: Array.isArray(info.permissions)
						? info.permissions
						: [],
					isSuperAdmin: !!info.isSuperAdmin,
					sub: info.sub,
				},
				isLoading: false,
				errors: null,
			}));
		} catch {
			setAuthState(prev => ({
				...prev,
				isLoading: false,
				errors: 'Error al verificar su sesión, ingrese de nuevo...',
			}));

			removeAccessToken();
		}
	};

	useEffect(
		() => {
			if (
				effectChangeFetch.current === true ||
				process.env.NODE_ENV !== 'development'
			) {
				checkSession();
			}

			return () => {
				effectChangeFetch.current = true;
			};
		},
		[] // solo corre al montar o renderizar
	);

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
