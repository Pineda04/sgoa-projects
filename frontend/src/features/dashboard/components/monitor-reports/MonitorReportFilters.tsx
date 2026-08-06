import { TMonitorBuilding } from '@api';
import { EReportGroupBy } from '@api/monitor';
import { TOutputTeacherPosition, useGetTeachersForAutocomplete } from '@api/teachers';
import { Button, SearchAsyncSelect } from '@shared/components';
import { customOptionsReactSelect } from '@shared/utils';
import {
	GROUP_BY_OPTIONS,
	isReportGroupBy,
} from './monitor-reports.utils';

const useTeachersSearch = (searchTerm: string) =>
	useGetTeachersForAutocomplete(searchTerm);

const inputClassName =
	'w-full bg-gray-100 shadow-md rounded-md px-3 py-2 text-sm outline-none border border-input focus:ring-2 focus:ring-primary/20 transition-colors';

interface MonitorReportFiltersProps {
	dateFrom: string;
	dateTo: string;
	buildingId: string;
	groupBy: EReportGroupBy;
	buildings: TMonitorBuilding[];
	teacherResetKey: number;
	onDateFromChange: (value: string) => void;
	onDateToChange: (value: string) => void;
	onBuildingChange: (buildingId: string) => void;
	onTeacherChange: (teacherId: string) => void;
	onGroupByChange: (groupBy: EReportGroupBy) => void;
	onReset: () => void;
}

export const MonitorReportFilters = ({
	dateFrom,
	dateTo,
	buildingId,
	groupBy,
	buildings,
	teacherResetKey,
	onDateFromChange,
	onDateToChange,
	onBuildingChange,
	onTeacherChange,
	onGroupByChange,
	onReset,
}: MonitorReportFiltersProps) => {
	return (
		<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5 lg:items-end">
			<div>
				<label
					htmlFor="report-date-from"
					className="mb-1.5 block text-xs font-semibold text-foreground"
				>
					Desde
				</label>
				<input
					id="report-date-from"
					type="date"
					value={dateFrom}
					max={dateTo || undefined}
					onChange={e => onDateFromChange(e.target.value)}
					className={inputClassName}
				/>
			</div>

			<div>
				<label
					htmlFor="report-date-to"
					className="mb-1.5 block text-xs font-semibold text-foreground"
				>
					Hasta
				</label>
				<input
					id="report-date-to"
					type="date"
					value={dateTo}
					min={dateFrom || undefined}
					onChange={e => onDateToChange(e.target.value)}
					className={inputClassName}
				/>
			</div>

			<div>
				<label
					htmlFor="report-teacher-filter"
					className="mb-1.5 block text-xs font-semibold text-foreground"
				>
					Docente
				</label>
				<SearchAsyncSelect<TOutputTeacherPosition>
					key={teacherResetKey}
					hook={useTeachersSearch}
					handleChange={teacher => onTeacherChange(teacher.id)}
					getOptionValue={t => t.id}
					getOptionLabel={t => t.name}
					formatOptionLabel={(data, { context }) =>
						customOptionsReactSelect(data.label, data.data.code, context)
					}
				/>
			</div>

			<div>
				<label
					htmlFor="report-building-filter"
					className="mb-1.5 block text-xs font-semibold text-foreground"
				>
					Edificio
				</label>
				<select
					id="report-building-filter"
					value={buildingId}
					onChange={e => onBuildingChange(e.target.value)}
					className={inputClassName}
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
					htmlFor="report-group-by-filter"
					className="mb-1.5 block text-xs font-semibold text-foreground"
				>
					Agrupar por
				</label>
				<select
					id="report-group-by-filter"
					value={groupBy}
					onChange={e => {
						if (isReportGroupBy(e.target.value)) {
							onGroupByChange(e.target.value);
						}
					}}
					className={inputClassName}
				>
					{GROUP_BY_OPTIONS.map(option => (
						<option key={option.value} value={option.value}>
							{option.label}
						</option>
					))}
				</select>
			</div>

			<div className="sm:col-span-2 lg:col-span-5">
				<Button
					type="button"
					variant="outline"
					size="sm"
					onClick={onReset}
					className="w-full sm:w-auto"
				>
					Limpiar filtros
				</Button>
			</div>
		</div>
	);
};
