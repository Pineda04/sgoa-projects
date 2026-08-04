import { Wifi, WifiOff } from 'lucide-react';
import { useIsOnline } from '@shared/hooks';

// Feature: indicador de conectividad (navigator.onLine) en paralelo al SyncIndicator.
// Muestra "En línea"/"Sin conexión" según el estado reactivo de red, sin importar
// el estado de sincronización (puede haber pendientes incluso estando online).
export const ConnectionIndicator = () => {
	const isOnline = useIsOnline();

	if (!isOnline) {
		return (
			<div
				role="status"
				aria-live="polite"
				className="flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-sm font-medium text-amber-700 shadow-sm dark:border-amber-900/50 dark:bg-amber-950/50 dark:text-amber-400"
			>
				<WifiOff className="size-4" />
				<span>Sin conexión</span>
			</div>
		);
	}

	return (
		<div
			role="status"
			aria-live="polite"
			className="flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-3 py-1.5 text-sm font-medium text-green-700 shadow-sm dark:border-green-900/50 dark:bg-green-950/50 dark:text-green-400"
		>
			<Wifi className="size-4" />
			<span>En línea</span>
		</div>
	);
};
