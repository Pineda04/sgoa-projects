import type { ZodSafeParseError } from 'zod';

export const errorsFormik = <T>(result: ZodSafeParseError<T>) => {
	// const errors: Record<string, string> = {};
	const errors: Record<symbol | number | string, string> = {};

	result.error.issues.map(error => {
		// errors.set(error.path[0], error.message);
		errors[error.path[0]] = error.message;
	});

	return errors;
};
