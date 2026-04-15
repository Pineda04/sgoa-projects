import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query';
import { queryErrorHandler, mutationErrorHandler } from './error-handler';

export const STALE_TIME = {
	SHORT: 1000 * 60, // 1 minuto - datos que cambian frecuentemente
	MEDIUM: 1000 * 60 * 2, // 2 minutos - datos de otros usuarios
	LONG: 1000 * 60 * 5, // 5 minutos - datos de perfil, periodos
	VERY_LONG: 1000 * 60 * 10, // 10 minutos - datos estáticos raramente change
} as const;

export const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			retry: false,
			refetchOnMount: true,
			refetchOnReconnect: true,
			refetchOnWindowFocus: false,
			refetchIntervalInBackground: false,
			refetchInterval: 0,
			staleTime: STALE_TIME.MEDIUM,
		},
		mutations: {
			retry: false,
		},
	},
	queryCache: new QueryCache({
		onError: queryErrorHandler,
	}),
	mutationCache: new MutationCache({
		onError: mutationErrorHandler,
	}),
});
