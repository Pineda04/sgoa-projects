import { LayoutGrid, List, Rows3, Search, SlidersHorizontal, X } from 'lucide-react';
import { Button } from '@shared/components';
import { TSyncStatus } from '@shared/hooks';
import { SyncIndicator } from '../SyncIndicator';
import { SegmentedControl, TSegmentedOption } from './SegmentedControl';
import {
	JORNADA_OPTIONS,
	TChecklistSummary,
	TChecklistView,
	TJornadaFilter,
	TStatusFilter,
} from './checklist.utils';

const VIEW_OPTIONS: TSegmentedOption<TChecklistView>[] = [
	{
		value: 'COMPACT',
		label: (
			<>
				<List className="size-4" />
				<span className="hidden lg:inline">Compacta</span>
			</>
		),
		title: 'Vista compacta',
		ariaLabel: 'Vista compacta',
	},
	{
		value: 'DETAILED',
		label: (
			<>
				<Rows3 className="size-4" />
				<span className="hidden lg:inline">Detalle</span>
			</>
		),
		title: 'Vista con detalles',
		ariaLabel: 'Vista con detalles',
	},
	{
		value: 'GRID',
		label: (
			<>
				<LayoutGrid className="size-4" />
				<span className="hidden lg:inline">Tarjetas</span>
			</>
		),
		title: 'Vista de tarjetas',
		ariaLabel: 'Vista de tarjetas',
	},
];

interface TBuildingOption {
	id: string;
	name: string;
}

interface ChecklistToolbarProps {
	jornada: TJornadaFilter;
	onJornadaChange: (jornada: TJornadaFilter) => void;
	jornadaPendingCounts: Record<TJornadaFilter, number>;
	view: TChecklistView;
	onViewChange: (view: TChecklistView) => void;
	search: string;
	onSearchChange: (search: string) => void;
	buildings: TBuildingOption[];
	buildingId: string;
	onBuildingChange: (buildingId: string) => void;
	status: TStatusFilter;
	onStatusChange: (status: TStatusFilter) => void;
	scopeSummary: TChecklistSummary;
	areFiltersOpen: boolean;
	onToggleFilters: () => void;
	onResetFilters: () => void;
	syncStatus: TSyncStatus;
	syncPendingCount: number;
	onSyncRetry: () => void;
}

export const ChecklistToolbar = ({
	jornada,
	onJornadaChange,
	jornadaPendingCounts,
	view,
	onViewChange,
	search,
	onSearchChange,
	buildings,
	buildingId,
	onBuildingChange,
	status,
	onStatusChange,
	scopeSummary,
	areFiltersOpen,
	onToggleFilters,
	onResetFilters,
	syncStatus,
	syncPendingCount,
	onSyncRetry,
}: ChecklistToolbarProps) => {
	const todayLabel = new Date().toLocaleDateString('es-HN', {
		weekday: 'long',
		day: 'numeric',
		month: 'long',
		year: 'numeric',
	});
	const activeFilterCount =
		(buildingId ? 1 : 0) + (status !== 'ALL' ? 1 : 0) + (search ? 1 : 0);

	const jornadaOptions: TSegmentedOption<TJornadaFilter>[] =
		JORNADA_OPTIONS.map(option => ({
			value: option.value,
			label: option.label,
			title: option.hint,
			badge: jornadaPendingCounts[option.value],
		}));

	const statusOptions: TSegmentedOption<TStatusFilter>[] = [
		{ value: 'ALL', label: 'Todas', badge: scopeSummary.total },
		{ value: 'PENDING', label: 'Pendientes', badge: scopeSummary.pending },
		{ value: 'VERIFIED', label: 'Verificadas', badge: scopeSummary.verified },
	];

	return (
		<div className="top-12.5 z-20 -mt-1 space-y-3 bg-card pt-1 pb-3 sm:top-14">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<h2 className="text-lg font-semibold capitalize text-foreground">
					{todayLabel}
				</h2>
				<div className="flex flex-wrap items-center justify-end gap-2">
					<SyncIndicator
						status={syncStatus}
						pendingCount={syncPendingCount}
						onRetry={onSyncRetry}
					/>
				</div>
			</div>

			<div className="flex flex-col gap-3 lg:flex-row lg:items-center">
				<SegmentedControl
					options={jornadaOptions}
					value={jornada}
					onChange={onJornadaChange}
					ariaLabel="Jornada"
					fullWidth
					className="lg:w-auto lg:flex-1"
				/>

				<SegmentedControl
					options={VIEW_OPTIONS}
					value={view}
					onChange={onViewChange}
					ariaLabel="Modo de visualización"
					className="hidden shrink-0 lg:inline-flex"
				/>
			</div>

			<div className="flex items-center gap-2">
				<div className="relative min-w-0 flex-1">
					<Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
					<input
						type="text"
						value={search}
						onChange={e => onSearchChange(e.target.value)}
						enterKeyHint="search"
						placeholder="Buscar aula, docente o asignatura"
						aria-label="Buscar asignaciones"
						className="h-10 w-full rounded-lg border border-input bg-background pr-9 pl-9 text-sm outline-none transition-colors focus:ring-2 focus:ring-primary/20"
					/>
					{search && (
						<button
							type="button"
							onClick={() => onSearchChange('')}
							aria-label="Limpiar búsqueda"
							className="absolute top-1/2 right-2 flex size-6 -translate-y-1/2 cursor-pointer items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
						>
							<X className="size-4" />
						</button>
					)}
				</div>

				<SegmentedControl
					options={VIEW_OPTIONS}
					value={view}
					onChange={onViewChange}
					ariaLabel="Modo de visualización"
					className="shrink-0 lg:hidden"
				/>

				<Button
					type="button"
					variant="outline"
					size="icon"
					onClick={onToggleFilters}
					aria-expanded={areFiltersOpen}
					aria-label="Mostrar filtros"
					title="Filtros"
					className="relative size-10 shrink-0 sm:hidden"
				>
					<SlidersHorizontal className="size-4" />
					{activeFilterCount > 0 && (
						<span className="absolute -top-1.5 -right-1.5 flex size-4.5 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
							{activeFilterCount}
						</span>
					)}
				</Button>
			</div>

			<div
				className={`${areFiltersOpen ? 'flex' : 'hidden'} flex-col gap-3 sm:flex sm:flex-row sm:items-center`}
			>
				<select
					value={buildingId}
					onChange={e => onBuildingChange(e.target.value)}
					aria-label="Filtrar por edificio"
					className="h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none transition-colors focus:ring-2 focus:ring-primary/20 sm:w-56"
				>
					<option value="">Todos los edificios</option>
					{buildings.map(building => (
						<option key={building.id} value={building.id}>
							{building.name}
						</option>
					))}
				</select>

				<SegmentedControl
					options={statusOptions}
					value={status}
					onChange={onStatusChange}
					ariaLabel="Estado de verificación"
					fullWidth
					className="sm:w-auto sm:flex-1"
				/>

				{activeFilterCount > 0 && (
					<Button
						type="button"
						variant="ghost"
						size="sm"
						onClick={onResetFilters}
						className="shrink-0"
					>
						Limpiar
					</Button>
				)}
			</div>
		</div>
	);
};
