import { TChecklistSummary } from './checklist.utils';

interface ProgressBarProps {
	value: number;
	total: number;
	className?: string;
}

export const ProgressBar = ({
	value,
	total,
	className = '',
}: ProgressBarProps) => {
	const percentage = total === 0 ? 0 : Math.round((value / total) * 100);

	return (
		<div
			className={`h-2 w-full overflow-hidden rounded-full bg-muted ${className}`}
			role="progressbar"
			aria-valuenow={value}
			aria-valuemin={0}
			aria-valuemax={total}
			aria-label={`${value} de ${total} asignaciones verificadas`}
		>
			<div
				className="h-full rounded-full bg-primary transition-[width] duration-300"
				style={{ width: `${percentage}%` }}
			/>
		</div>
	);
};

interface ChecklistProgressProps {
	summary: TChecklistSummary;
}

export const ChecklistProgress = ({ summary }: ChecklistProgressProps) => {
	const { total, verified, pending } = summary;
	const percentage = total === 0 ? 0 : Math.round((verified / total) * 100);
	const isComplete = total > 0 && pending === 0;

	return (
		<div className="rounded-xl border border-card-border bg-card p-3 sm:p-4">
			<div className="mb-2 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
				<p className="text-sm font-semibold text-foreground">
					{isComplete
						? '¡Jornada completa!'
						: `${pending} ${pending === 1 ? 'pendiente' : 'pendientes'}`}
				</p>
				<p className="text-xs text-muted-foreground tabular-nums">
					{verified} de {total} verificadas · {percentage}%
				</p>
			</div>

			<ProgressBar value={verified} total={total} />
		</div>
	);
};
