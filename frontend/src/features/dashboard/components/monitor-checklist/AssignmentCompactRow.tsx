import { CheckActions } from './CheckActions';
import { CheckResult, StatusBadge } from './CheckStatus';
import { TAssignmentViewProps } from './checklist.utils';

export const AssignmentCompactRow = ({
	item,
	isSubmitting,
	disabled,
	onConfirm,
	onOpenModal,
	onEditCheck,
}: TAssignmentViewProps) => {
	const isPending = item.status === 'PENDING';

	return (
		<li className="flex flex-col gap-2.5 px-3 py-3 sm:flex-row sm:items-center sm:gap-4 sm:px-4">
			<div className="flex min-w-0 flex-1 items-start gap-3">
				<span className="w-28 shrink-0 text-sm font-semibold tabular-nums text-foreground">
					{item.timeRange ?? '—'}
				</span>

				<div className="min-w-0 flex-1">
					<p
						className="truncate text-sm font-medium text-foreground"
						title={item.assignment.courseName}
					>
						{item.assignment.courseName}
					</p>
					<p className="truncate text-xs text-muted-foreground">
						{item.classroomName} · {item.assignment.teacher.name}
					</p>
				</div>

				{!isPending && <StatusBadge status={item.status} />}
			</div>

			{isPending ? (
				<CheckActions
					isSubmitting={isSubmitting}
					disabled={disabled}
					onConfirm={onConfirm}
					onOpenModal={onOpenModal}
					className="sm:w-72 sm:shrink-0"
				/>
			) : (
				item.check && (
					<CheckResult
						check={item.check}
						onEdit={item.canEditCheck ? onEditCheck : undefined}
						disabled={disabled}
						className="pl-15 sm:w-72 sm:shrink-0 sm:justify-end sm:pl-0 sm:text-right"
					/>
				)
			)}
		</li>
	);
};
