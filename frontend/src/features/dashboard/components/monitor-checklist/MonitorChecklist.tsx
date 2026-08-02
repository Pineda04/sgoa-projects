import { useMemo, useState } from 'react';
import { CircleCheck } from 'lucide-react';
import { useGetCurrentAssignments } from '@api/monitor';
import { SkeletonCard, useLocalStorageState, useModal } from '@shared';
import { BuildingAccordion } from './BuildingAccordion';
import { CheckModal } from './CheckModal';
import { ChecklistProgress } from './ChecklistProgress';
import { ChecklistToolbar } from './ChecklistToolbar';
import { useRegisterCheck } from './useRegisterCheck';
import {
	buildChecklistItems,
	CHECKLIST_VIEW_STORAGE_KEY,
	countPendingByJornada,
	filterByScope,
	filterByStatus,
	getCurrentJornada,
	groupItemsByBuilding,
	isChecklistView,
	summarizeItems,
	TChecklistItem,
	TChecklistView,
	TJornadaFilter,
	TStatusFilter,
} from './checklist.utils';

export const MonitorChecklist = () => {
	const { data, isLoading, isError } = useGetCurrentAssignments();
	const { registerCheck, checkOverrides, submittingId, isRegistering } =
		useRegisterCheck();

	const [view, setView] = useLocalStorageState<TChecklistView>(
		CHECKLIST_VIEW_STORAGE_KEY,
		'COMPACT',
		isChecklistView
	);
	const [jornada, setJornada] = useState<TJornadaFilter>(getCurrentJornada);
	const [buildingId, setBuildingId] = useState('');
	const [status, setStatus] = useState<TStatusFilter>('ALL');
	const [search, setSearch] = useState('');
	const [areFiltersOpen, setAreFiltersOpen] = useState(false);
	const [collapsedBuildingIds, setCollapsedBuildingIds] = useState<Set<string>>(
		new Set()
	);
	const [selectedId, setSelectedId] = useState<string | null>(null);
	const [isModalOpen, openModal, closeModal] = useModal();

	const items = useMemo(
		() => buildChecklistItems(data ?? [], checkOverrides),
		[data, checkOverrides]
	);

	const buildingOptions = useMemo(
		() =>
			(data ?? []).map(building => ({
				id: building.buildingId,
				name: building.buildingName,
			})),
		[data]
	);

	const jornadaPendingCounts = useMemo(() => {
		const scoped = filterByScope(items, {
			jornada: 'ALL',
			buildingId,
			search,
		});

		return {
			MORNING: countPendingByJornada(scoped, 'MORNING'),
			AFTERNOON: countPendingByJornada(scoped, 'AFTERNOON'),
			ALL: countPendingByJornada(scoped, 'ALL'),
		};
	}, [items, buildingId, search]);

	const scopeItems = useMemo(
		() => filterByScope(items, { jornada, buildingId, search }),
		[items, jornada, buildingId, search]
	);
	const scopeSummary = useMemo(() => summarizeItems(scopeItems), [scopeItems]);

	const groups = useMemo(
		() => groupItemsByBuilding(filterByStatus(scopeItems, status)),
		[scopeItems, status]
	);

	const selectedItem = items.find(item => item.id === selectedId) ?? null;

	const handleToggleBuilding = (buildingIdToToggle: string) => {
		setCollapsedBuildingIds(prev => {
			const next = new Set(prev);
			if (next.has(buildingIdToToggle)) next.delete(buildingIdToToggle);
			else next.add(buildingIdToToggle);
			return next;
		});
	};

	const handleResetFilters = () => {
		setBuildingId('');
		setStatus('ALL');
		setSearch('');
	};

	const handleQuickConfirm = (item: TChecklistItem, isPresent: boolean) => {
		void registerCheck({ courseClassroomId: item.id, isPresent });
	};

	const handleOpenModal = (item: TChecklistItem) => {
		setSelectedId(item.id);
		openModal();
	};

	const handleModalSubmit = (isPresent: boolean, observation: string) => {
		if (!selectedItem) return Promise.resolve(false);

		return registerCheck({
			courseClassroomId: selectedItem.id,
			isPresent,
			observation,
		});
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
			<p className="text-sm text-destructive">
				Error al cargar las asignaciones del día. Intenta nuevamente.
			</p>
		);
	}

	if (items.length === 0) {
		return (
			<p className="py-12 text-center text-muted-foreground">
				No hay asignaciones para el día de hoy
			</p>
		);
	}

	return (
		<div className="space-y-4">
			<ChecklistToolbar
				jornada={jornada}
				onJornadaChange={setJornada}
				jornadaPendingCounts={jornadaPendingCounts}
				view={view}
				onViewChange={setView}
				search={search}
				onSearchChange={setSearch}
				buildings={buildingOptions}
				buildingId={buildingId}
				onBuildingChange={setBuildingId}
				status={status}
				onStatusChange={setStatus}
				scopeSummary={scopeSummary}
				areFiltersOpen={areFiltersOpen}
				onToggleFilters={() => setAreFiltersOpen(prev => !prev)}
				onResetFilters={handleResetFilters}
			/>

			{scopeSummary.total > 0 && <ChecklistProgress summary={scopeSummary} />}

			{groups.length === 0 ? (
				<div className="py-12 text-center">
					{scopeSummary.total > 0 && status === 'PENDING' ? (
						<>
							<CircleCheck className="mx-auto mb-3 size-10 text-green-500" />
							<p className="font-medium text-foreground">
								No quedan verificaciones pendientes
							</p>
							<p className="text-sm text-muted-foreground">
								Ya registraste todas las asignaciones de esta selección.
							</p>
						</>
					) : (
						<p className="text-muted-foreground">
							No hay asignaciones que coincidan con los filtros seleccionados.
						</p>
					)}
				</div>
			) : (
				<div className="space-y-3">
					{groups.map(group => (
						<BuildingAccordion
							key={group.buildingId}
							group={group}
							view={view}
							isOpen={!collapsedBuildingIds.has(group.buildingId)}
							onToggle={() => handleToggleBuilding(group.buildingId)}
							submittingId={submittingId}
							isRegistering={isRegistering}
							onConfirm={handleQuickConfirm}
							onOpenModal={handleOpenModal}
						/>
					))}
				</div>
			)}

			<CheckModal
				isOpen={isModalOpen}
				onClose={closeModal}
				item={selectedItem}
				isSubmitting={isRegistering}
				onSubmit={handleModalSubmit}
			/>
		</div>
	);
};
