import { useEffect, useState } from 'react';

// Feature: estado reactivo de conectividad (navigator.onLine) para decidir entre
// leer del backend o de la caché local (Dexie) en los flujos offline del monitor.
export const useIsOnline = () => {
	const [isOnline, setIsOnline] = useState(navigator.onLine);

	useEffect(() => {
		const handleOnline = () => setIsOnline(true);
		const handleOffline = () => setIsOnline(false);

		window.addEventListener('online', handleOnline);
		window.addEventListener('offline', handleOffline);

		return () => {
			window.removeEventListener('online', handleOnline);
			window.removeEventListener('offline', handleOffline);
		};
	}, []);

	return isOnline;
};
