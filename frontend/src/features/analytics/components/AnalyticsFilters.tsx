import { RotateCcw } from 'lucide-react';
import { Button, SkeletonInput } from '@shared/components';
import type { AnalyticsFilterMode } from '@api/analytics';
import {
	useAnalyticsFilters,
	type ImplementedAnalyticsDomain,
} from '../hooks';

interface FilterOption {
	id: string;
	label: string;
}

interface FilterFieldProps {
	label: string;
	mode: AnalyticsFilterMode;
	value?: string;
	options: FilterOption[];
	placeholder: string;
	onChange: (value: string) => void;
	disabled?: boolean;
}

const FilterField = ({
	label,
	mode,
	value,
	options,
	placeholder,
	onChange,
	disabled,
}: FilterFieldProps) => {
	if (mode === 'hidden') return null;
	const selected = options.find(option => option.id === value);
	return (
		<label className="text-sm font-semibold text-foreground">
			<span className="mb-2 block">{label}</span>
			{mode === 'locked' ? (
				<span className="block min-h-11 rounded-lg border border-border bg-muted px-3 py-2.5 font-normal">
					{selected?.label ?? 'Sin información'}
				</span>
			) : (
				<select
					value={value ?? ''}
					onChange={event => onChange(event.target.value)}
					disabled={disabled}
					className="min-h-11 w-full rounded-lg border border-input bg-background px-3 py-2 font-normal text-foreground shadow-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60"
				>
					<option value="">{placeholder}</option>
					{options.map(option => (
						<option key={option.id} value={option.id}>
							{option.label}
						</option>
					))}
				</select>
			)}
		</label>
	);
};

export const AnalyticsFilters = ({
	domain,
}: {
	domain: ImplementedAnalyticsDomain;
}) => {
	const filters = useAnalyticsFilters(domain);
	const {
		options,
		effectiveOptions,
		context,
		values,
		scopedOptions,
		isResolvingTeachers,
		setPeriodId,
		setComparisonPeriodId,
		setCenterDepartmentId,
		setTeacherId,
		setBuildingId,
		setMonitoringDateRange,
		setCatalogFilter,
		setActivityTimeMode,
		setActivityYear,
		setActivityPacPair,
		resetFilters,
	} = filters;
	if (!options || !context) {
		return (
			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
				{Array.from({ length: 4 }, (_, index) => (
					<SkeletonInput key={index} className="h-16" />
				))}
			</div>
		);
	}
	const usesPeriod = domain !== 'staff';
	const usesTeacher =
		domain === 'academic-load' ||
		domain === 'enrollment' ||
		domain === 'staff' ||
		domain === 'activities' ||
		domain === 'monitoring';
	const canCompare = domain === 'academic-load' || domain === 'enrollment';
	const comparisonOptions = options.options.periods.filter(
		period => period.id !== values.periodId
	);
	const staffContext = effectiveOptions?.domainContexts.staff;
	const activityContext = effectiveOptions?.domainContexts.activities;
	const monitoringContext = effectiveOptions?.domainContexts.monitoring;
	const pacOptions = options.options.periods.filter(
		period => period.year === values.activityYear
	);
	const selectedPac = pacOptions.find(
		period =>
			String(period.pac) === values.activityPac &&
			period.modality === values.activityPacModality
	)?.id;

	return (
		<div>
			<div className="mb-4 flex items-center justify-between gap-3">
				<div>
					<h2 className="text-lg font-semibold text-card-foreground">Filtros</h2>
					<p className="text-xs text-muted-foreground">
						Las opciones reflejan el alcance autorizado de esta sección.
					</p>
				</div>
				<Button variant="ghost" size="sm" onClick={resetFilters}>
					<RotateCcw className="size-4" />
					Restablecer
				</Button>
			</div>
			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
				{domain === 'activities' ? (
					<FilterField
						label="Modo temporal"
						mode="selectable"
						value={values.activityTimeMode}
						options={[
							{ id: 'period', label: 'Período académico' },
							{ id: 'year', label: 'Año' },
						]}
						placeholder="Selecciona el modo"
						onChange={value =>
							setActivityTimeMode(value === 'year' ? 'year' : 'period')
						}
					/>
				) : null}
				{usesPeriod &&
				(domain !== 'activities' || values.activityTimeMode === 'period') ? (
					<FilterField
						label="Período"
						mode={options.filters.periodId}
						value={values.periodId}
						options={options.options.periods}
						placeholder="Selecciona un período"
						onChange={setPeriodId}
					/>
				) : null}
				{domain === 'activities' && values.activityTimeMode === 'year' ? (
					<>
						<FilterField
							label="Año"
							mode="selectable"
							value={values.activityYear ? String(values.activityYear) : undefined}
							options={(activityContext?.catalogs.availableYears ?? []).map(year => ({
								id: String(year),
								label: String(year),
							}))}
							placeholder="Selecciona un año"
							onChange={setActivityYear}
						/>
						<FilterField
							label="PAC y modalidad"
							mode="selectable"
							value={selectedPac}
							options={pacOptions}
							placeholder="Todos los períodos del año"
							onChange={setActivityPacPair}
						/>
					</>
				) : null}
				{canCompare ? (
					<FilterField
						label="Comparar con"
						mode={
							options.capabilities.canComparePeriods
								? options.filters.comparisonPeriodId
								: 'hidden'
						}
						value={values.comparisonPeriodId}
						options={comparisonOptions}
						placeholder="Sin comparación"
						onChange={setComparisonPeriodId}
					/>
				) : null}
				<FilterField
					label="Centro y departamento"
					mode={context.filters.centerDepartmentId}
					value={values.centerDepartmentId}
					options={context.options.centerDepartments}
					placeholder="Todos los autorizados"
					onChange={setCenterDepartmentId}
				/>
				{usesTeacher ? (
					<FilterField
						label="Docente"
						mode={context.filters.teacherId}
						value={values.teacherId}
						options={context.options.teachers}
						placeholder={
							isResolvingTeachers ? 'Cargando docentes...' : 'Todos los docentes'
						}
						onChange={setTeacherId}
						disabled={isResolvingTeachers}
					/>
				) : null}
				{domain === 'monitoring' && monitoringContext ? (
					<>
						<FilterField
							label="Edificio"
							mode={monitoringContext.filters.buildingId}
							value={values.buildingId}
							options={monitoringContext.options.buildings}
							placeholder="Todos los edificios autorizados"
							onChange={setBuildingId}
						/>
						<label className="text-sm font-semibold text-foreground">
							<span className="mb-2 block">Desde</span>
							<input
								type="date"
								value={values.dateFrom}
								max={values.dateTo}
								onChange={event =>
									setMonitoringDateRange(event.target.value, values.dateTo)
								}
								className="min-h-11 w-full rounded-lg border border-input bg-background px-3 py-2 font-normal"
							/>
						</label>
						<label className="text-sm font-semibold text-foreground">
							<span className="mb-2 block">Hasta</span>
							<input
								type="date"
								value={values.dateTo}
								min={values.dateFrom}
								onChange={event =>
									setMonitoringDateRange(values.dateFrom, event.target.value)
								}
								className="min-h-11 w-full rounded-lg border border-input bg-background px-3 py-2 font-normal"
							/>
						</label>
					</>
				) : null}
				{domain === 'staff' && staffContext ? (
					<>
						<FilterField label="Contrato" mode="selectable" value={values.contractTypeId} options={staffContext.catalogs.contractTypes} placeholder="Todos" onChange={value => setCatalogFilter('contractTypeId', value)} />
						<FilterField label="Categoría" mode="selectable" value={values.categoryId} options={staffContext.catalogs.categories} placeholder="Todas" onChange={value => setCatalogFilter('categoryId', value)} />
						<FilterField label="Jornada" mode="selectable" value={values.shiftId} options={staffContext.catalogs.shifts} placeholder="Todas" onChange={value => setCatalogFilter('shiftId', value)} />
						<FilterField label="Cargo vigente" mode="selectable" value={values.positionId} options={staffContext.catalogs.positions} placeholder="Todos" onChange={value => setCatalogFilter('positionId', value)} />
					</>
				) : null}
				{domain === 'activities' && activityContext ? (
					<FilterField label="Tipo de actividad" mode="selectable" value={values.activityTypeId} options={activityContext.catalogs.activityTypes} placeholder="Todos" onChange={value => setCatalogFilter('activityTypeId', value)} />
				) : null}
			</div>
			{scopedOptions.isError ? (
				<p className="mt-3 text-sm text-destructive">
					No fue posible actualizar las opciones del centro seleccionado.
				</p>
			) : null}
		</div>
	);
};
