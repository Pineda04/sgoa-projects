import { Pencil } from 'lucide-react';
import { TMonitorAssignmentCheckStatus } from '@api/monitor';
import { formatHondurasDateTime } from '@shared/utils';
import {
	ASSIGNMENT_STATUS_CONFIG,
	isCheckEdited,
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
	onEdit?: () => void;
	disabled?: boolean;
	className?: string;
}

export const CheckResult = ({
	check,
	onEdit,
	disabled = false,
	className = '',
}: CheckResultProps) => (
	<div className={`flex min-w-0 items-start gap-2 ${className}`}>
		<div className="min-w-0 text-xs text-muted-foreground">
			<p>Verificado a las {check.checkTime}</p>
			{check.observation && (
				<p className="line-clamp-2 italic" title={check.observation}>
					“{check.observation}”
				</p>
			)}
			{isCheckEdited(check) && (
				<p className="font-medium text-amber-600 dark:text-amber-400">
					Editado: {formatHondurasDateTime(check.updatedAt)}
				</p>
			)}
		</div>
		{onEdit && (
			<button
				type="button"
				onClick={onEdit}
				disabled={disabled}
				title="Editar verificación"
				aria-label="Editar verificación"
				className="flex shrink-0 cursor-pointer items-center gap-1 rounded-md p-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
			>
				<Pencil className="size-3.5" />
			</button>
		)}
	</div>
);
