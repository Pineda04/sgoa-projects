import { TMonitorAssignmentCheckStatus, TMonitorCurrentAssignment } from '@api/monitor';
import { Button } from '@shared/components';
import {
	ASSIGNMENT_STATUS_CONFIG,
	formatDays,
	getAssignmentStatus,
	parseStartTime,
} from './checklist.utils';

interface AssignmentCardProps {
	assignment: TMonitorCurrentAssignment;
	buildingName: string;
	classroomName: string;
	check: TMonitorAssignmentCheckStatus | null;
	onRegister: () => void;
}

export const AssignmentCard = ({
	assignment,
	buildingName,
	classroomName,
	check,
	onRegister,
}: AssignmentCardProps) => {
	const status = getAssignmentStatus(check);
	const statusConfig = ASSIGNMENT_STATUS_CONFIG[status];
	const startTime = parseStartTime(assignment.section);

	const schedule = `${formatDays(assignment.days)}${startTime ? ` · ${startTime}` : ''}`;

	return (
		<div className="flex h-full flex-col rounded-lg border border-border bg-card p-4 shadow-sm">
			<div className="flex items-start justify-between gap-3">
				<div className="min-w-0">
					<p className="truncate font-semibold text-foreground" title={assignment.courseName}>
						{assignment.courseName}
					</p>
					<p className="text-xs text-muted-foreground">
						{assignment.courseCode}
					</p>
				</div>
				<span
					className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${statusConfig.badgeClassName}`}
				>
					{statusConfig.label}
				</span>
			</div>

			<dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
				<div className="min-w-0">
					<dt className="text-xs text-muted-foreground">Aula</dt>
					<dd className="truncate font-medium text-foreground" title={classroomName}>
						{classroomName}
					</dd>
				</div>
				<div className="min-w-0">
					<dt className="text-xs text-muted-foreground">Edificio</dt>
					<dd className="truncate font-medium text-foreground" title={buildingName}>
						{buildingName}
					</dd>
				</div>
				<div className="min-w-0">
					<dt className="text-xs text-muted-foreground">Docente</dt>
					<dd
						className="truncate font-medium text-foreground"
						title={assignment.teacher.name}
					>
						{assignment.teacher.name}
					</dd>
				</div>
				<div className="min-w-0">
					<dt className="text-xs text-muted-foreground">Sección</dt>
					<dd className="truncate font-medium text-foreground">
						{assignment.groupCode}
					</dd>
				</div>
				<div className="col-span-2 min-w-0">
					<dt className="text-xs text-muted-foreground">Horario</dt>
					<dd className="truncate font-medium text-foreground" title={schedule}>
						{schedule}
					</dd>
				</div>
			</dl>

			<div className="mt-4 flex flex-1 items-end">
				{status === 'PENDING' ? (
					<Button size="sm" className="w-full" onClick={onRegister}>
						Registrar
					</Button>
				) : (
					check && (
						<p className="line-clamp-2 text-xs text-muted-foreground">
							Verificado a las {check.checkTime}
							{check.observation ? ` · ${check.observation}` : ''}
						</p>
					)
				)}
			</div>
		</div>
	);
};
