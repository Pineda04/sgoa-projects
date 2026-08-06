import { useMemo, useState } from 'react';
import { AlertTriangle, CircleCheck } from 'lucide-react';
import {
	type DigitalBlackboardUseStatus,
	useGetCurrentAssignments,
} from '@api/monitor';
import { useAuth } from '@config/providers';
import { db } from '@config/lib';
import {
	useCachedAssignments,
	useIsOnline,
	useLocalStorageState,
	useModal,
} from '@shared/hooks';
import type { TSyncStatus } from '@shared/hooks';
import { SkeletonCard } from '@shared';
import { askConfirm } from '@shared/utils';
import { BuildingAccordion } from './BuildingAccordion';
import { CheckModal } from './CheckModal';
import { ChecklistProgress } from './ChecklistProgress';
import { ChecklistToolbar } from './ChecklistToolbar';
import { useRegisterCheck } from './useRegisterCheck';
import {
	useOfflineChecksToday,
	useOfflineSyncIssues,
} from './useOfflineChecksToday';
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

interface MonitorChecklistProps {
	syncStatus?: TSyncStatus;
	syncPendingCount?: number;
	onSyncRetry?: () => void;
}

export const MonitorChecklist = ({
	syncStatus = 'SYNCED',
	syncPendingCount = 0,
	onSyncRetry,
}: MonitorChecklistProps) => {
	const isOnline = useIsOnline();
	// Feature: email de la sesión (JWT) como clave de la caché Dexie; disponible offline.
	const { authState } = useAuth();
	const sessionEmail = authState.user?.email;
	const { data, isLoading, isError } = useGetCurrentAssignments({
		enabled: isOnline,
		email: sessionEmail,
	});
	// Feature: leer las asignaciones desde Dexie cuando no hay red (sin llamar al endpoint).
	// Fallback encadenado: conserva los datos ya cargados durante la transición de red,
	// cuando la fuente nueva aún no se resolvió (fetch remoto o lectura asíncrona de Dexie).
	const cachedAssignments = useCachedAssignments(sessionEmail);
	const sourceData = data ?? cachedAssignments;
	// Feature: los registros locales (Dexie) del día son la fuente de respaldo del estado
	// registrado mientras el servidor no confirme el check (aún no sincronizado). useLiveQuery
	// reacciona a cada add/update/delete, sobrevive a los desmontajes (navegar a otra página)
	// y evita duplicados al sincronizar.
	const effectiveOverrides = useOfflineChecksToday(sessionEmail);
	const syncIssues = useOfflineSyncIssues(sessionEmail);
	const { registerCheck, editCheck, submittingId, isRegistering } =
		useRegisterCheck(sessionEmail, isOnline);

	const [view, setView] = useLocalStorageState<TChecklistView>(
		CHECKLIST_VIEW_STORAGE_KEY,
		'COMPACT',
		(value): value is TChecklistView => isChecklistView(String(value))
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
	const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
	const [isModalOpen, openModal, closeModal] = useModal();

	const currentUserId = authState.user?.sub;

	const items = useMemo(
		() => buildChecklistItems(sourceData ?? [], effectiveOverrides, currentUserId),
		[sourceData, effectiveOverrides, currentUserId]
	);

	const buildingOptions = useMemo(
		() =>
			(sourceData ?? []).map(building => ({
				id: building.buildingId,
				name: building.buildingName,
			})),
		[sourceData]
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

	const handleDiscardSyncIssue = async (offlineId: string) => {
		const confirmed = await askConfirm(
			'Esta verificación se eliminará de este dispositivo y no se podrá recuperar. ¿Deseas descartarla?',
			'Descartar'
		);
		if (!confirmed) return;

		void db.offlineChecks.delete(offlineId);
	};

	const handleQuickConfirm = (item: TChecklistItem, isPresent: boolean) => {
		if (isPresent && item.assignment.hasDigitalBlackboard) {
			handleOpenModal(item);
			return;
		}
		void registerCheck({ courseClassroomId: item.id, isPresent });
	};

	const handleOpenModal = (item: TChecklistItem) => {
		setSelectedId(item.id);
		setModalMode('create');
		openModal();
	};

	const handleOpenEditModal = (item: TChecklistItem) => {
		setSelectedId(item.id);
		setModalMode('edit');
		openModal();
	};

	const handleModalSubmit = (
		isPresent: boolean,
		observation: string,
		digitalBlackboardUseStatus?: DigitalBlackboardUseStatus
	) => {
		if (!selectedItem) return Promise.resolve(false);

		if (modalMode === 'edit' && selectedItem.check) {
			return editCheck({
				checkId: selectedItem.check.id,
				courseClassroomId: selectedItem.id,
				isPresent,
				observation,
				checkTime: selectedItem.check.checkTime,
				isLocalOnly: selectedItem.checkSource === 'LOCAL',
				digitalBlackboardUseStatus,
			});
		}

		return registerCheck({
			courseClassroomId: selectedItem.id,
			isPresent,
			observation,
			digitalBlackboardUseStatus,
		});
	};

	if (isLoading && !sourceData) {
		return (
			<div className="space-y-3">
				<SkeletonCard fields={5} />
				<SkeletonCard fields={5} />
				<SkeletonCard fields={5} />
			</div>
		);
	}

	if (isError && !sourceData) {
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
			{syncIssues.length > 0 && (
				<section
					className="rounded-lg border border-amber-300 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/40"
					aria-labelledby="sync-issues-title"
				>
					<div className="flex items-center gap-2 text-amber-900 dark:text-amber-200">
						<AlertTriangle className="size-5" />
						<h3 id="sync-issues-title" className="font-semibold">
							Verificaciones que requieren revisión
						</h3>
					</div>
					<ul className="mt-3 space-y-2 text-sm">
						{syncIssues.map(issue => {
							const item = items.find(
								check => check.id === issue.courseClassroomId
							);
							return (
								<li
									key={issue.offlineId}
									className="flex flex-wrap items-center justify-between gap-2 rounded border border-amber-200 bg-background p-2 dark:border-amber-900"
								>
									<span>
										{item?.assignment.courseName ?? issue.courseClassroomId}: {issue.syncReason}
									</span>
									<button
										type="button"
										onClick={() => handleDiscardSyncIssue(issue.offlineId)}
										className="rounded border border-amber-400 px-2 py-1 text-xs font-semibold text-amber-900 hover:bg-amber-100 dark:text-amber-200"
									>
										Descartar
									</button>
								</li>
							);
						})}
					</ul>
				</section>
			)}
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
				syncStatus={syncStatus}
				syncPendingCount={syncPendingCount}
				onSyncRetry={onSyncRetry ?? (() => undefined)}
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
							onEditCheck={handleOpenEditModal}
						/>
					))}
				</div>
			)}

			<CheckModal
				isOpen={isModalOpen}
				onClose={closeModal}
				item={selectedItem}
				mode={modalMode}
				isSubmitting={isRegistering}
				onSubmit={handleModalSubmit}
			/>
		</div>
	);
};
