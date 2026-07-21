export type TStatusFilter = 'ALL' | 'PENDING' | 'VERIFIED';

interface TBuildingOption {
	id: string;
	name: string;
}

interface ChecklistFiltersProps {
	buildings: TBuildingOption[];
	buildingId: string;
	onBuildingChange: (buildingId: string) => void;
	status: TStatusFilter;
	onStatusChange: (status: TStatusFilter) => void;
}

const selectClassName =
	'w-full bg-gray-100 shadow-md rounded-md px-3 py-2 text-sm outline-none border border-input focus:ring-2 focus:ring-primary/20 transition-colors';

export const ChecklistFilters = ({
	buildings,
	buildingId,
	onBuildingChange,
	status,
	onStatusChange,
}: ChecklistFiltersProps) => {
	return (
		<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:max-w-md">
			<div>
				<label
					htmlFor="checklist-building-filter"
					className="mb-1.5 block text-xs font-semibold text-foreground"
				>
					Edificio
				</label>
				<select
					id="checklist-building-filter"
					value={buildingId}
					onChange={e => onBuildingChange(e.target.value)}
					className={selectClassName}
				>
					<option value="">Todos los edificios</option>
					{buildings.map(building => (
						<option key={building.id} value={building.id}>
							{building.name}
						</option>
					))}
				</select>
			</div>

			<div>
				<label
					htmlFor="checklist-status-filter"
					className="mb-1.5 block text-xs font-semibold text-foreground"
				>
					Estado
				</label>
				<select
					id="checklist-status-filter"
					value={status}
					onChange={e => onStatusChange(e.target.value as TStatusFilter)}
					className={selectClassName}
				>
					<option value="ALL">Todos</option>
					<option value="PENDING">Pendientes</option>
					<option value="VERIFIED">Verificados</option>
				</select>
			</div>
		</div>
	);
};
