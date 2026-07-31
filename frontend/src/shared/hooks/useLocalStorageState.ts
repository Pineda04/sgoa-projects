import { useCallback, useState } from 'react';

const readStoredValue = <T>(
	key: string,
	isValid: (value: unknown) => value is T,
	fallback: T
): T => {
	if (typeof window === 'undefined') return fallback;

	try {
		const raw = window.localStorage.getItem(key);
		if (raw === null) return fallback;

		const parsed: unknown = JSON.parse(raw);
		return isValid(parsed) ? parsed : fallback;
	} catch {
		return fallback;
	}
};

export const useLocalStorageState = <T>(
	key: string,
	fallback: T,
	isValid: (value: unknown) => value is T
) => {
	const [value, setValue] = useState<T>(() =>
		readStoredValue(key, isValid, fallback)
	);

	const setPersistedValue = useCallback(
		(next: T) => {
			setValue(next);

			try {
				window.localStorage.setItem(key, JSON.stringify(next));
			} catch {
				// El almacenamiento puede no estar disponible
			}
		},
		[key]
	);

	return [value, setPersistedValue] as const;
};
