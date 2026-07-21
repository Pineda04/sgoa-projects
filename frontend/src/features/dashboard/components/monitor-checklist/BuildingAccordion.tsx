import { TMonitorBuildingAssignments, TMonitorCurrentAssignment } from '@api/monitor';
import { AssignmentCard } from './AssignmentCard';
import { getAssignmentStatus } from './checklist.utils';

interface BuildingAccordionProps {
	building: TMonitorBuildingAssignments;
	isOpen: boolean;
	onToggle: () => void;
	onRegister: (
		assignment: TMonitorCurrentAssignment,
		classroomName: string
	) => void;
}

export const BuildingAccordion = ({
	building,
	isOpen,
	onToggle,
	onRegister,
}: BuildingAccordionProps) => {
	const allAssignments = building.classrooms.flatMap(c => c.assignments);
	const total = allAssignments.length;
	const pending = allAssignments.filter(
		a => getAssignmentStatus(a.check) === 'PENDING'
	).length;

	return (
		<div className="overflow-hidden rounded-xl border border-border">
			<button
				type="button"
				onClick={onToggle}
				className="flex w-full items-center justify-between gap-3 bg-muted/40 px-4 py-3 text-left"
			>
				<div>
					<p className="font-semibold text-foreground">
						{building.buildingName}
					</p>
					<p className="text-xs text-muted-foreground">
						{total - pending} de {total} verificadas
					</p>
				</div>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth={2}
					className={`size-5 shrink-0 text-muted-foreground transition-transform ${
						isOpen ? 'rotate-180' : ''
					}`}
				>
					<path d="M6 9l6 6 6-6" />
				</svg>
			</button>

			{isOpen && (
				<div className="space-y-5 border-t border-border p-4">
					{building.classrooms.map(classroom => (
						<div key={classroom.classroomId}>
							<p className="mb-2 text-sm font-semibold text-muted-foreground">
								{classroom.classroomName}
							</p>
							<div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
								{classroom.assignments.map(assignment => (
									<AssignmentCard
										key={assignment.courseClassroomId}
										assignment={assignment}
										buildingName={building.buildingName}
										classroomName={classroom.classroomName}
										check={assignment.check}
										onRegister={() =>
											onRegister(assignment, classroom.classroomName)
										}
									/>
								))}
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
};
