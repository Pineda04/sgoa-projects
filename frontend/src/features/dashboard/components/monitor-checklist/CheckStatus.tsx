import { TMonitorAssignmentCheckStatus } from '@api/monitor';
import {
	ASSIGNMENT_STATUS_CONFIG,
	TAssignmentStatus,
} from './checklist.utils';

interface StatusBadgeProps {
	status: TAssignmentStatus;
	className?: string;
}

export const StatusBadge = ({ status, className = '' }: StatusBadgeProps) => {
	const { label, badgeClassName, dotClassName } =
		ASSIGNMENT_STATUS_CONFIG[status];

	return (
		<span
			className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${badgeClassName} ${className}`}
		>
			<span className={`size-1.5 rounded-full ${dotClassName}`} aria-hidden />
			{label}
		</span>
	);
};

interface CheckResultProps {
	check: TMonitorAssignmentCheckStatus;
	className?: string;
}

export const CheckResult = ({ check, className = '' }: CheckResultProps) => (
	<div className={`min-w-0 text-xs text-muted-foreground ${className}`}>
		<p>
			{check.syncStatus === 'pending'
				? `Pendiente de sincronización · ${check.checkTime}`
				: `Verificado a las ${check.checkTime}`}
		</p>
		{check.digitalBlackboardUseStatus ? (
			<p>
				Pizarra:{' '}
				{check.digitalBlackboardUseStatus === 'USED'
					? 'usada'
					: check.digitalBlackboardUseStatus === 'NOT_USED'
						? 'no usada'
						: 'no se pudo determinar'}
			</p>
		) : null}
		{check.observation && (
			<p className="line-clamp-2 italic" title={check.observation}>
				“{check.observation}”
			</p>
		)}
	</div>
);
