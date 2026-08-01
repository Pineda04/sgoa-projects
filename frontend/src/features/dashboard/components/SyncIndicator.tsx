import { Cloud, CloudOff, Loader2 } from 'lucide-react';
import { TSyncStatus } from '@shared/hooks';

interface SyncIndicatorProps {
	status: TSyncStatus;
	pendingCount: number;
}

export const SyncIndicator = ({ status, pendingCount }: SyncIndicatorProps) => {
	if (status === 'OFFLINE') {
		return (
			<div className="flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-sm font-medium text-amber-700 shadow-sm dark:border-amber-900/50 dark:bg-amber-950/50 dark:text-amber-400">
				<CloudOff className="size-4" />
				<span>Sin conexión — Guardando localmente ({pendingCount})</span>
			</div>
		);
	}

	if (status === 'SYNCING') {
		return (
			<div className="flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700 shadow-sm dark:border-blue-900/50 dark:bg-blue-950/50 dark:text-blue-400">
				<Loader2 className="size-4 animate-spin" />
				<span>Sincronizando {pendingCount} registro(s)...</span>
			</div>
		);
	}

	return (
		<div className="flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-3 py-1.5 text-sm font-medium text-green-700 shadow-sm transition-opacity duration-1000 opacity-70 hover:opacity-100 dark:border-green-900/50 dark:bg-green-950/50 dark:text-green-400">
			<Cloud className="size-4" />
			<span>Actualizado</span>
		</div>
	);
};
