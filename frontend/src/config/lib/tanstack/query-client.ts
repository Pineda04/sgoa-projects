import {
	defaultShouldDehydrateQuery,
	MutationCache,
	QueryCache,
	QueryClient,
} from '@tanstack/react-query';
import { persistQueryClient } from '@tanstack/react-query-persist-client';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { get, set, del } from 'idb-keyval';
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
			// Mantiene el caché 24 horas en IndexedDB para que las asignaciones
			// del día estén disponibles aunque el monitor no tenga conexión.
			gcTime: 1000 * 60 * 60 * 24,
			// Intenta servir el caché antes de fallar por falta de red.
			networkMode: 'offlineFirst',
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

// Persister de IndexedDB para las queries GET (asignaciones, edificios, etc.)
// Se usa idb-keyval (< 1KB) para guardar pares clave-valor en IndexedDB,
// dejando a Dexie libre para las tablas de negocio (offlineChecks).
const indexedDBPersister = createAsyncStoragePersister({
	storage: {
		getItem: async (key: string) => (await get<string>(key)) ?? null,
		setItem: async (key: string, value: string) => await set(key, value),
		removeItem: async (key: string) => await del(key),
	},
});

persistQueryClient({
	queryClient,
	persister: indexedDBPersister,
	maxAge: 1000 * 60 * 60 * 24, // 24 horas
	dehydrateOptions: {
		// Solo persisten asignaciones y período vigente con propietario explícito.
		shouldDehydrateQuery: query => {
			const [scope, resource, owner] = query.queryKey;
			const isOwnerScopedCurrentData =
				typeof owner === 'string' &&
				owner.length > 0 &&
				((scope === 'monitor' && resource === 'current-assignments') ||
					(scope === 'academic-periods' && resource === 'current'));
			return (
				defaultShouldDehydrateQuery(query) &&
				isOwnerScopedCurrentData
			);
		},
	},
});
