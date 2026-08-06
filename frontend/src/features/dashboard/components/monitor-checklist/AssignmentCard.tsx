import { Clock } from 'lucide-react';
import { CheckActions } from './CheckActions';
import { CheckResult, StatusBadge } from './CheckStatus';
import { TAssignmentViewProps } from './checklist.utils';
export const AssignmentCard = ({
	item,
	isSubmitting,
	disabled,
	onConfirm,
	onOpenModal,
	onEditCheck,
}: TAssignmentViewProps) => {
	const isPending = item.status === 'PENDING';

	return (
		<li className="flex h-full flex-col rounded-xl border border-card-border bg-card p-4 shadow-sm">
			<div className="flex items-start justify-between gap-3">
				<div className="min-w-0">
					<p
						className="truncate font-semibold text-foreground"
						title={item.assignment.courseName}
					>
						{item.assignment.courseName}
					</p>
					<p className="text-xs text-muted-foreground">
						{item.assignment.courseCode} · Grupo {item.assignment.groupCode}
					</p>
				</div>
				<StatusBadge status={item.status} />
			</div>

			<div className="mt-3 flex items-center gap-2 text-sm">
				<span className="flex shrink-0 items-center gap-1.5 rounded-lg bg-muted px-2 py-1 font-semibold tabular-nums text-foreground">
					<Clock className="size-3.5 text-muted-foreground" />
					{item.timeRange ?? '—'}
				</span>
				<span
					className="truncate font-medium text-foreground"
					title={`${item.classroomName} · ${item.buildingName}`}
				>
					{item.classroomName}
				</span>
			</div>

			<dl className="mt-3 space-y-2">
				<div className="min-w-0">
					<dt className="text-xs text-muted-foreground">Docente</dt>
					<dd
						className="truncate text-sm font-medium text-foreground"
						title={item.assignment.teacher.name}
					>
						{item.assignment.teacher.name}
					</dd>
				</div>
				<div className="min-w-0">
					<dt className="text-xs text-muted-foreground">Horario</dt>
					<dd
						className="truncate text-sm font-medium text-foreground"
						title={item.schedule}
					>
						{item.schedule}
					</dd>
				</div>
			</dl>

			<div className="mt-4 flex flex-1 items-end">
				{isPending ? (
					<CheckActions
						isSubmitting={isSubmitting}
						disabled={disabled}
						onConfirm={onConfirm}
						onOpenModal={onOpenModal}
						className="w-full"
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
