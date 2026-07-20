import { useMemo, useState } from 'react';
import {
	TMonitorAssignmentCheckStatus,
	TMonitorCurrentAssignment,
	useGetCurrentAssignments,
} from '@api/monitor';
import { SkeletonCard, useModal } from '@shared';
import { BuildingAccordion } from './BuildingAccordion';
import { CheckModal } from './CheckModal';
import { ChecklistFilters, TStatusFilter } from './ChecklistFilters';
import { JornadaToggle } from './JornadaToggle';
import {
	getAssignmentStatus,
	getCurrentJornada,
	getJornadaFromSection,
	TJornada,
} from './checklist.utils';

interface SelectedAssignment {
	assignment: TMonitorCurrentAssignment;
	classroomName: string;
	buildingName: string;
}

export const MonitorChecklist = () => {
	const { data, isLoading, isError } = useGetCurrentAssignments();

	const [jornada, setJornada] = useState<TJornada>(getCurrentJornada);
	const [buildingId, setBuildingId] = useState('');
	const [statusFilter, setStatusFilter] = useState<TStatusFilter>('ALL');
	const [collapsedBuildingIds, setCollapsedBuildingIds] = useState<
		Set<string>
	>(new Set());
	const [checkOverrides, setCheckOverrides] = useState<
		Record<string, TMonitorAssignmentCheckStatus>
	>({});
	const [selected, setSelected] = useState<SelectedAssignment | null>(null);
	const [isModalOpen, openModal, closeModal] = useModal();

	const buildingOptions = useMemo(
		() =>
			(data ?? []).map(building => ({
				id: building.buildingId,
				name: building.buildingName,
			})),
		[data]
	);

	const visibleBuildings = useMemo(() => {
		if (!data) return [];

		return data
			.filter(building => !buildingId || building.buildingId === buildingId)
			.map(building => ({
				...building,
				classrooms: building.classrooms
					.map(classroom => ({
						...classroom,
						assignments: classroom.assignments
							.map(assignment => ({
								...assignment,
								check: checkOverrides[assignment.courseClassroomId] ?? assignment.check,
							}))
							.filter(assignment => {
								const assignmentJornada = getJornadaFromSection(
									assignment.section
								);
								const matchesJornada =
									assignmentJornada === null || assignmentJornada === jornada;

								const status = getAssignmentStatus(assignment.check);
								const matchesStatus =
									statusFilter === 'ALL' ||
									(statusFilter === 'PENDING' && status === 'PENDING') ||
									(statusFilter === 'VERIFIED' && status !== 'PENDING');

								return matchesJornada && matchesStatus;
							}),
					}))
					.filter(classroom => classroom.assignments.length > 0),
			}))
			.filter(building => building.classrooms.length > 0);
	}, [data, buildingId, jornada, statusFilter, checkOverrides]);

	const handleToggleBuilding = (buildingIdToToggle: string) => {
		setCollapsedBuildingIds(prev => {
			const next = new Set(prev);
			if (next.has(buildingIdToToggle)) next.delete(buildingIdToToggle);
			else next.add(buildingIdToToggle);
			return next;
		});
	};

	const handleRegister = (
		assignment: TMonitorCurrentAssignment,
		classroomName: string,
		buildingName: string
	) => {
		setSelected({ assignment, classroomName, buildingName });
		openModal();
	};

	const handleCheckComplete = (
		courseClassroomId: string,
		check: TMonitorAssignmentCheckStatus
	) => {
		setCheckOverrides(prev => ({ ...prev, [courseClassroomId]: check }));
	};

	if (isLoading) {
		return (
			<div className="space-y-3">
				<SkeletonCard fields={5} />
				<SkeletonCard fields={5} />
				<SkeletonCard fields={5} />
			</div>
		);
	}

	if (isError) {
		return (
			<p className="text-sm text-red-500">
				Error al cargar las asignaciones del día. Intenta nuevamente.
			</p>
		);
	}

	if (!data || data.length === 0) {
		return (
			<p className="text-muted-foreground text-center py-12">
				No hay asignaciones para el día de hoy
			</p>
		);
	}

	return (
		<div className="space-y-5">
			<div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
				<JornadaToggle value={jornada} onChange={setJornada} />
				<ChecklistFilters
					buildings={buildingOptions}
					buildingId={buildingId}
					onBuildingChange={setBuildingId}
					status={statusFilter}
					onStatusChange={setStatusFilter}
				/>
			</div>

			{visibleBuildings.length === 0 ? (
				<p className="text-muted-foreground text-center py-12">
					No hay asignaciones que coincidan con los filtros seleccionados.
				</p>
			) : (
				<div className="space-y-3">
					{visibleBuildings.map(building => (
						<BuildingAccordion
							key={building.buildingId}
							building={building}
							isOpen={!collapsedBuildingIds.has(building.buildingId)}
							onToggle={() => handleToggleBuilding(building.buildingId)}
							onRegister={(assignment, classroomName) =>
								handleRegister(
									assignment,
									classroomName,
									building.buildingName
								)
							}
						/>
					))}
				</div>
			)}

			<CheckModal
				isOpen={isModalOpen}
				onClose={closeModal}
				assignment={selected?.assignment ?? null}
				buildingName={selected?.buildingName ?? ''}
				classroomName={selected?.classroomName ?? ''}
				onCheckComplete={handleCheckComplete}
			/>
		</div>
	);
};
