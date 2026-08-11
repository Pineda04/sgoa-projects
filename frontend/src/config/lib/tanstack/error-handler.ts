import { authApi } from '@api/auth';
import {
	setAccessToken,
	removeAccessToken,
	removeRefreshToken,
	getAccessToken,
} from '@features/auth/utils';
import { IErrorResponse } from '@shared/interfaces';
import { ESwalIcons, genericAlert } from '@shared/utils';
import { Query, Mutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';

type AnyQuery = Query<unknown, unknown, unknown, readonly unknown[]>;
type AnyMutation = Mutation<unknown, unknown, unknown, unknown>;

let isRedirecting = false;
let isRefreshing = false;

let failedQueue: {
	query?: AnyQuery;
	mutation?: AnyMutation;
	variables?: unknown;
}[] = [];

const errorHandler = (
	error: unknown,
	query?: AnyQuery,
	mutation?: AnyMutation,
	variables?: unknown
) => {
	// Fix: los errores de red no traen response (undefined) y el destructuring lanzaba
	// un TypeError. Ahora se detecta y se sale sin tocar el flujo de 401/refresh.
	const { status, data } =
		(error as AxiosError<IErrorResponse>).response ?? {};

	if (!status) {
		console.error('Error de red o inesperado:', error);
		return;
	}

	if (status === 401) {
		if (!getAccessToken()) return;
		if (mutation) refreshTokenAndRetry(undefined, mutation, variables);
		else refreshTokenAndRetry(query);
	} else {
		const [message, timer] =
			Array.isArray(data?.data) && data.data.length
				? [data.data.map(el => `- ${el}`).join(`<br />`), 5000]
				: [
						data?.message ||
							'Ocurrió un error al realizar la petición.',
						1500,
					];

		genericAlert(
			message.replace(/<(\w+)>/g, `&lt;$1&gt;`),
			ESwalIcons.ERROR,
			timer
		);
	}
};

export const queryErrorHandler = (
	error: unknown,
	query: Query<unknown, unknown, unknown, readonly unknown[]>
) => {
	// if (error instanceof Error) errorHandler(error, query);
	// else console.error("Error: ", error);
	errorHandler(error, query);
};

export const mutationErrorHandler = (
	error: unknown,
	variables: unknown,
	_context: unknown,
	mutation: Mutation<unknown, unknown, unknown, unknown>
) => {
	errorHandler(error, undefined, mutation, variables);
};

const processFailedQueue = () => {
	failedQueue.forEach(({ query, mutation, variables }) => {
		if (mutation) {
			const { options } = mutation;
			// mutation.setOptions({ ...options, variables });
			// mutation.execute();
			mutation.setOptions(options);
			mutation.execute(variables);
		}
		if (query) query.fetch();
	});
	isRefreshing = false;
	failedQueue = [];
};

const refreshTokenAndRetry = async (
	query?: AnyQuery,
	mutation?: AnyMutation,
	variables?: unknown
) => {
	try {
		if (!isRefreshing) {
			isRefreshing = true;

			failedQueue.push({ query, mutation, variables });

			const { access_token } = await authApi.refreshToken();

			setAccessToken(access_token);
			processFailedQueue();
		} else failedQueue.push({ query, mutation, variables });
	} catch {
		removeAccessToken();
		await removeRefreshToken();

		isRefreshing = false;
		failedQueue = [];

		if (!isRedirecting) {
			isRedirecting = true;
			window.location.href = '/auth/login';
		}
	}
};
