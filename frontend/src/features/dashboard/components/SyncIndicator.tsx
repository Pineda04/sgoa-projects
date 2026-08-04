import {
	AlertTriangle,
	CheckCircle2,
	CloudOff,
	Loader2,
	RefreshCw,
	WifiOff,
} from 'lucide-react';
import { TSyncStatus } from '@shared/hooks';

interface SyncIndicatorProps {
	status: TSyncStatus;
	pendingCount: number;
	onRetry?: () => void;
}

const STATUS_STYLES: Record<
	TSyncStatus,
	{ className: string; tooltip: string }
> = {
	SYNCED: {
		className:
			'border-green-200 bg-green-50 text-green-700 dark:border-green-900/50 dark:bg-green-950/50 dark:text-green-400',
		tooltip: 'Toda la información está sincronizada con el servidor.',
	},
	OFFLINE: {
		className:
			'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/50 dark:text-amber-400',
		tooltip:
			'Sin conexión a internet. Las verificaciones se guardan en este dispositivo y se sincronizarán automáticamente al reconectar.',
	},
	SYNCING: {
		className:
			'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/50 dark:bg-blue-950/50 dark:text-blue-400',
		tooltip: 'Enviando las verificaciones pendientes al servidor.',
	},
	ERROR: {
		className:
			'border-red-200 bg-red-50 text-red-700 dark:border-red-900/50 dark:bg-red-950/50 dark:text-red-400',
		tooltip:
			'No se pudieron sincronizar algunas verificaciones. Revisa tu conexión e inténtalo de nuevo.',
	},
};

const pluralize = (count: number, singular: string, plural: string) =>
	count === 1 ? singular : plural;

export const SyncIndicator = ({
	status,
	pendingCount,
	onRetry,
}: SyncIndicatorProps) => {
	const config = STATUS_STYLES[status];

	let label: string;
	switch (status) {
		case 'OFFLINE':
			label =
				pendingCount > 0
					? `Sin conexión · ${pendingCount} pendiente${pluralize(
							pendingCount,
							'',
							's'
					  )} en este dispositivo`
					: 'Sin conexión';
			break;
		case 'SYNCING':
			label = `Sincronizando ${pendingCount} registro${pluralize(
				pendingCount,
				'',
				's'
			)}…`;
			break;
		case 'ERROR':
			label = `Error al sincronizar ${pendingCount} registro${pluralize(
				pendingCount,
				'',
				's'
			)}`;
			break;
		default:
			label = 'Todo sincronizado';
	}

	const Icon =
		status === 'SYNCING'
			? Loader2
			: status === 'SYNCED'
				? CheckCircle2
				: status === 'OFFLINE'
					? WifiOff
					: AlertTriangle;

	return (
		<div
			role="status"
			aria-live="polite"
			title={config.tooltip}
			className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium shadow-sm transition-colors duration-300 ${config.className}`}
		>
			{status === 'OFFLINE' && pendingCount > 0 ? (
				<CloudOff className="size-4 shrink-0" />
			) : (
				<Icon
					className={`size-4 shrink-0 ${status === 'SYNCING' ? 'animate-spin' : ''}`}
				/>
			)}
			<span className="whitespace-nowrap">{label}</span>
			{status === 'ERROR' && onRetry && (
				<button
					type="button"
					onClick={onRetry}
					className="ml-1 inline-flex items-center gap-1 rounded-full border border-red-300 bg-white px-2.5 py-1 text-xs font-semibold text-red-700 hover:bg-red-100 dark:border-red-800 dark:bg-red-950 dark:text-red-300 dark:hover:bg-red-900"
				>
					<RefreshCw className="size-3" />
					Reintentar
				</button>
			)}
		</div>
	);
};
