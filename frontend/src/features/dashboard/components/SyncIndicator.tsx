import { AlertTriangle, Cloud, CloudOff, Loader2, RefreshCw } from 'lucide-react';
import { TSyncStatus } from '@shared/hooks';

interface SyncIndicatorProps {
	status: TSyncStatus;
	pendingCount: number;
	onRetry?: () => void;
}

export const SyncIndicator = ({
	status,
	pendingCount,
	onRetry,
}: SyncIndicatorProps) => {
	if (status === 'OFFLINE') {
		return (
			<div
				role="status"
				aria-live="polite"
				className="flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-sm font-medium text-amber-700 shadow-sm dark:border-amber-900/50 dark:bg-amber-950/50 dark:text-amber-400"
			>
				<CloudOff className="size-4" />
				<span>Sin conexión — Guardando localmente ({pendingCount})</span>
			</div>
		);
	}

	if (status === 'SYNCING') {
		return (
			<div
				role="status"
				aria-live="polite"
				className="flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700 shadow-sm dark:border-blue-900/50 dark:bg-blue-950/50 dark:text-blue-400"
			>
				<Loader2 className="size-4 animate-spin" />
				<span>Sincronizando {pendingCount} registro(s)...</span>
			</div>
		);
	}

	if (status === 'ERROR') {
		return (
			<div
				role="status"
				aria-live="polite"
				className="flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700 shadow-sm dark:border-red-900/50 dark:bg-red-950/50 dark:text-red-400"
			>
				<AlertTriangle className="size-4" />
				<span>Error al sincronizar {pendingCount} registro(s)</span>
				{onRetry ? (
					<button
						type="button"
						onClick={onRetry}
						className="ml-1 inline-flex items-center gap-1 rounded-full border border-red-300 bg-white px-2.5 py-1 text-xs font-semibold text-red-700 hover:bg-red-100 dark:border-red-800 dark:bg-red-950 dark:text-red-300 dark:hover:bg-red-900"
					>
						<RefreshCw className="size-3" />
						Reintentar
					</button>
				) : null}
			</div>
		);
	}

	return (
		<div
			role="status"
			aria-live="polite"
			className="flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-3 py-1.5 text-sm font-medium text-green-700 shadow-sm transition-opacity duration-1000 opacity-70 hover:opacity-100 dark:border-green-900/50 dark:bg-green-950/50 dark:text-green-400"
		>
			<Cloud className="size-4" />
			<span>Actualizado</span>
		</div>
	);
};
