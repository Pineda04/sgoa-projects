import { Clock } from 'lucide-react';
import { CheckActions } from './CheckActions';
import { CheckResult, StatusBadge } from './CheckStatus';
import { TAssignmentViewProps } from './checklist.utils';

interface FieldProps {
	label: string;
	value: string;
}

const Field = ({ label, value }: FieldProps) => (
	<div className="min-w-0">
		<dt className="text-xs text-muted-foreground">{label}</dt>
		<dd className="truncate text-sm font-medium text-foreground" title={value}>
			{value}
		</dd>
	</div>
);

export const AssignmentDetailedRow = ({
	item,
	isSubmitting,
	disabled,
	onConfirm,
	onOpenModal,
	onEditCheck,
}: TAssignmentViewProps) => {
	const isPending = item.status === 'PENDING';

	return (
		<li className="rounded-xl border border-card-border bg-card p-4 shadow-sm">
			<div className="flex items-start justify-between gap-3">
				<div className="flex min-w-0 items-start gap-3">
					<span className="flex shrink-0 items-center gap-1.5 rounded-lg bg-muted px-2.5 py-1 text-sm font-semibold tabular-nums text-foreground">
						<Clock className="size-3.5 text-muted-foreground" />
						{item.timeRange ?? '—'}
					</span>
					<div className="min-w-0">
						<p
							className="truncate font-semibold text-foreground"
							title={item.assignment.courseName}
						>
							{item.assignment.courseName}
						</p>
						<p className="text-xs text-muted-foreground">
							{item.assignment.courseCode} · Grupo{' '}
							{item.assignment.groupCode}
						</p>
					</div>
				</div>

				<StatusBadge status={item.status} />
			</div>

			<dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-4">
				<Field label="Aula" value={item.classroomName} />
				<Field label="Edificio" value={item.buildingName} />
				<Field label="Docente" value={item.assignment.teacher.name} />
				<Field label="Horario" value={item.schedule} />
			</dl>

			<div className="mt-4 border-t border-border pt-3">
				{isPending ? (
					<CheckActions
						isSubmitting={isSubmitting}
						disabled={disabled}
						onConfirm={onConfirm}
						onOpenModal={onOpenModal}
						className="sm:max-w-md sm:ml-auto"
					/>
				) : (
					item.check && (
						<CheckResult
							check={item.check}
							onEdit={item.canEditCheck ? onEditCheck : undefined}
							disabled={disabled}
						/>
					)
				)}
			</div>
		</li>
	);
};
