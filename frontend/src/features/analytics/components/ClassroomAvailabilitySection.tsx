import { useState } from 'react';
import { AlertTriangle, CheckCircle2, CircleHelp, Loader2 } from 'lucide-react';
import type { IResponsiveColumn } from '@shared/components';
import {
	Button,
	PaginationControls,
	ResponsiveTable,
	Skeleton,
} from '@shared/components';
import { downloadBlob, ESwalIcons, genericAlert } from '@shared/utils';
import {
	analyticsApi,
	isClassroomAvailabilitySort,
	useClassroomAvailability,
	useClassroomAvailabilityDetails,
	type ClassroomAvailabilityRow,
	type ClassroomAvailabilityMetricKey,
	type ClassroomAvailabilitySort,
	type ClassroomAvailabilityStatus,
} from '@api/analytics';
import { useAnalyticsFilters } from '../hooks';
import { MetricCard } from './MetricCard';

const DAYS = [
	{ value: 'Lu', label: 'Lunes' },
	{ value: 'Ma', label: 'Martes' },
	{ value: 'Mi', label: 'Miércoles' },
	{ value: 'Ju', label: 'Jueves' },
	{ value: 'Vi', label: 'Viernes' },
	{ value: 'Sa', label: 'Sábado' },
	{ value: 'Do', label: 'Domingo' },
] as const;

const METRICS = [
	{ key: 'eligibleClassrooms', label: 'Aulas elegibles' },
	{ key: 'occupiedClassrooms', label: 'Aulas ocupadas' },
	{ key: 'availableClassrooms', label: 'Aulas disponibles' },
	{ key: 'indeterminateClassrooms', label: 'Aulas indeterminadas' },
	{ key: 'occupancyRate', label: 'Ocupación' },
] satisfies { key: ClassroomAvailabilityMetricKey; label: string }[];

const SORT_OPTIONS = [
	{ value: 'classroomName:asc', label: 'Aula A-Z' },
	{ value: 'classroomName:desc', label: 'Aula Z-A' },
	{ value: 'buildingName:asc', label: 'Edificio A-Z' },
	{ value: 'buildingName:desc', label: 'Edificio Z-A' },
	{ value: 'status:asc', label: 'Estado ascendente' },
	{ value: 'status:desc', label: 'Estado descendente' },
] satisfies { value: ClassroomAvailabilitySort; label: string }[];

const STATUS_BADGES = {
	available: {
		label: 'Disponible',
		className: 'border-primary/30 bg-primary-light text-primary',
		Icon: CheckCircle2,
	},
	occupied: {
		label: 'Ocupada',
		className: 'border-destructive/30 bg-destructive/10 text-destructive',
		Icon: AlertTriangle,
	},
	indeterminate: {
		label: 'Indeterminada',
		className: 'border-accent/40 bg-accent/10 text-foreground',
		Icon: CircleHelp,
	},
} satisfies Record<
	ClassroomAvailabilityStatus,
	{ label: string; className: string; Icon: typeof CheckCircle2 }
>;

const AvailabilityStatus = ({ row }: { row: ClassroomAvailabilityRow }) => {
	const badge = STATUS_BADGES[row.status];
	const Icon = badge.Icon;
	return (
		<div className="flex flex-col items-start gap-1.5">
			<span
				className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-semibold ${badge.className}`}
			>
				<Icon className="size-3.5" aria-hidden="true" />
				{badge.label}
			</span>
			{row.dataStatus === 'partial' ? (
				<span className="rounded-full border border-border bg-muted px-2 py-0.5 text-[0.625rem] font-semibold text-muted-foreground">
					Calidad parcial
				</span>
			) : null}
		</div>
	);
};

const Conflicts = ({ row }: { row: ClassroomAvailabilityRow }) => {
	if (!row.conflicts.length) {
		return <span className="text-muted-foreground">Sin conflictos</span>;
	}
	return (
		<div className="w-32 space-y-2 whitespace-normal text-left sm:w-auto sm:max-w-80">
			{row.conflicts.map((conflict, index) => (
				<div
					key={`${conflict.visibility}-${conflict.startTime}-${conflict.endTime}-${index}`}
					className="rounded-md border border-border bg-background px-2.5 py-2 text-xs"
				>
					{conflict.visibility === 'restricted' ? (
						<p>
							Clase fuera de tu alcance · {conflict.startTime} - {conflict.endTime}
						</p>
					) : (
						<>
							<p className="font-semibold text-foreground">
								{conflict.courseName} ({conflict.courseCode}) · Grupo{' '}
								{conflict.groupCode}
							</p>
							<p className="mt-1 text-muted-foreground">{conflict.teacherName}</p>
							<p className="text-muted-foreground">
								{conflict.startTime} - {conflict.endTime}
							</p>
						</>
					)}
				</div>
			))}
		</div>
	);
};

const ScheduleIssues = ({ row }: { row: ClassroomAvailabilityRow }) => {
	if (!row.scheduleIssues.length) {
		return <span className="text-muted-foreground">Sin incidencias</span>;
	}
	return (
		<div className="w-32 space-y-2 whitespace-normal text-left sm:w-auto sm:max-w-64">
			{row.scheduleIssues.map((issue, index) => (
				<div
					key={`${issue.visibility}-${issue.reason}-${index}`}
					className="text-xs"
				>
					<p className="font-semibold text-foreground">
						{issue.reason === 'invalid_schedule_days'
							? 'Días de clase inválidos'
							: 'Rango de clase inválido'}
					</p>
					{issue.visibility === 'restricted' ? (
						<p className="break-words text-muted-foreground">
							Incidencia en una clase fuera de tu alcance.
						</p>
					) : (
						<p className="break-words text-muted-foreground">
							Días: {issue.rawDays || 'Vacío'} · Horario:{' '}
							{issue.rawSection || 'Vacío'}
						</p>
					)}
				</div>
			))}
		</div>
	);
};

const COLUMNS = [
	{
		key: 'classroomName',
		header: 'Aula',
		render: (row: ClassroomAvailabilityRow) => (
			<p className="font-semibold text-foreground">{row.classroomName}</p>
		),
	},
	{
		key: 'buildingName',
		header: 'Ubicación',
		render: (row: ClassroomAvailabilityRow) => (
			<div className="text-left">
				<p>{row.buildingName}</p>
				<p className="text-xs text-muted-foreground">{row.centerName}</p>
			</div>
		),
	},
	{
		key: 'status',
		header: 'Estado',
		render: (row: ClassroomAvailabilityRow) => (
			<AvailabilityStatus row={row} />
		),
	},
	{
		key: 'conflicts',
		header: 'Clases en conflicto',
		mobileLabel: 'Conflictos',
		render: (row: ClassroomAvailabilityRow) => <Conflicts row={row} />,
	},
	{
		key: 'scheduleIssues',
		header: 'Incidencias',
		render: (row: ClassroomAvailabilityRow) => <ScheduleIssues row={row} />,
	},
] satisfies IResponsiveColumn<ClassroomAvailabilityRow>[];

export const ClassroomAvailabilitySection = () => {
	const {
		classroomFilters,
		classroomUsesDomainScope,
		classroomIgnoresTeacherFilter,
		classroomRangeIsValid,
		classroomPage,
		classroomSort,
		options,
		size,
		values,
		setClassroomDayOfWeek,
		setClassroomEndTime,
		setClassroomPage,
		setClassroomSort,
		setClassroomStartTime,
	} = useAnalyticsFilters('classrooms');
	const [isExporting, setIsExporting] = useState(false);
	const summary = useClassroomAvailability(classroomFilters);
	const details = useClassroomAvailabilityDetails(
		classroomFilters
			? {
					...classroomFilters,
					metric: 'classroom_availability',
					page: String(classroomPage),
					size: String(size),
					sort: classroomSort,
				}
			: undefined
	);
	const totalPages = Math.ceil(
		(details.data?.meta.total ?? 0) / (details.data?.meta.size ?? size)
	);
	const isPageOutOfRange = Boolean(
		details.data && classroomPage > Math.max(totalPages, 1)
	);
	const handleSortChange = (value: string) => {
		if (isClassroomAvailabilitySort(value)) setClassroomSort(value);
	};
	const handleExport = async () => {
		if (!classroomFilters) return;
		setIsExporting(true);
		try {
			const response = await analyticsApi.exportClassroomAvailabilityDetails({
				metric: 'classroom_availability',
				...classroomFilters,
				sort: classroomSort,
			});
			downloadBlob(
				response.data,
				`analytics-disponibilidad-aulas-${classroomFilters.periodId}.xlsx`
			);
		} catch {
			await genericAlert(
				'No fue posible exportar la disponibilidad de aulas. Intenta nuevamente.',
				ESwalIcons.ERROR
			);
		} finally {
			setIsExporting(false);
		}
	};

	return (
		<div>
			<div className="mb-5">
				<h2 className="text-xl font-semibold text-card-foreground">
					Disponibilidad de aulas
				</h2>
				<p className="mt-1 text-sm text-muted-foreground">
					Consulta el estado de cada aula para un día y rango horario.
				</p>
			</div>

			<div className="mb-5 rounded-xl border border-card-border bg-muted/40 p-4">
				<div className="grid gap-4 sm:grid-cols-3">
					<label className="text-sm font-semibold text-foreground">
						<span className="mb-1.5 block">Día</span>
						<select
							value={values.dayOfWeek}
							onChange={event => setClassroomDayOfWeek(event.target.value)}
							className="min-h-11 w-full rounded-lg border border-input bg-background px-3 py-2 font-normal outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
						>
							{DAYS.map(day => (
								<option key={day.value} value={day.value}>
									{day.label}
								</option>
							))}
						</select>
					</label>
					<label className="text-sm font-semibold text-foreground">
						<span className="mb-1.5 block">Hora de inicio</span>
						<input
							type="time"
							value={values.startTime}
							onChange={event => setClassroomStartTime(event.target.value)}
							className="min-h-11 w-full rounded-lg border border-input bg-background px-3 py-2 font-normal outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
						/>
					</label>
					<label className="text-sm font-semibold text-foreground">
						<span className="mb-1.5 block">Hora de fin</span>
						<input
							type="time"
							value={values.endTime}
							onChange={event => setClassroomEndTime(event.target.value)}
							className="min-h-11 w-full rounded-lg border border-input bg-background px-3 py-2 font-normal outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
						/>
					</label>
				</div>
				{!classroomRangeIsValid ? (
					<p className="mt-3 text-sm font-medium text-destructive">
						Ingresa horas válidas y asegúrate de que la hora de inicio sea menor
						que la hora de fin.
					</p>
				) : null}
			</div>

			{classroomUsesDomainScope ? (
				<p className="mb-4 rounded-lg border border-border bg-muted px-3 py-2 text-xs text-muted-foreground">
					Este bloque usa el alcance autorizado específico de aulas.
					{classroomIgnoresTeacherFilter
						? ' El filtro global de docente no aplica a esta consulta.'
						: ''}
				</p>
			) : null}

			{!values.periodId ? (
				<p className="py-8 text-center text-sm text-muted-foreground">
					No hay un período académico autorizado para consultar.
				</p>
			) : !classroomRangeIsValid ? null : summary.isError ? (
				<div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
					No fue posible cargar los indicadores de disponibilidad de aulas.
				</div>
			) : summary.isPending ? (
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
					{METRICS.map(metric => (
						<Skeleton key={metric.key} className="h-36 rounded-xl" />
					))}
				</div>
			) : (
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
					{METRICS.map(metric => (
						<MetricCard
							key={metric.key}
							label={metric.label}
							metric={summary.data.metrics[metric.key]}
						/>
					))}
				</div>
			)}

			{classroomFilters ? (
				<div className="mt-8 border-t border-border pt-6">
					<div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
						<div>
							<h3 className="text-lg font-semibold text-card-foreground">
								Detalle por aula
							</h3>
							<p className="text-xs text-muted-foreground">
								{details.data
									? `${details.data.meta.total} aula${details.data.meta.total === 1 ? '' : 's'}`
									: 'Detalle paginado'}
							</p>
							{details.data?.notes.includes('current_classroom_catalog') ? (
								<p className="mt-1 text-xs font-medium text-muted-foreground">
									Catálogo actual de aulas aplicado
								</p>
							) : null}
						</div>
						<div className="flex flex-col gap-2 sm:flex-row sm:items-end">
							<label className="text-sm font-semibold text-foreground">
								<span className="mb-1 block">Ordenar por</span>
								<select
									value={classroomSort}
									onChange={event => handleSortChange(event.target.value)}
									className="min-h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm font-normal text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
								>
									{SORT_OPTIONS.map(option => (
										<option key={option.value} value={option.value}>
											{option.label}
										</option>
									))}
								</select>
							</label>
							{options?.capabilities.canExport ? (
								<Button onClick={handleExport} disabled={isExporting}>
									{isExporting ? (
										<Loader2 className="size-4 animate-spin" aria-hidden="true" />
									) : null}
									{isExporting ? 'Exportando…' : 'Exportar Excel'}
								</Button>
							) : null}
						</div>
					</div>

					{details.isError ? (
						<div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
							No fue posible cargar el detalle de disponibilidad de aulas.
						</div>
					) : isPageOutOfRange ? (
						<div className="rounded-xl border border-card-border bg-muted px-5 py-8 text-center">
							<p className="text-sm font-semibold text-foreground">
								La página solicitada ya no está disponible.
							</p>
							<p className="mt-1 text-xs text-muted-foreground">
								Los filtros actuales tienen {totalPages} página
								{totalPages === 1 ? '' : 's'} de resultados.
							</p>
							<Button
								className="mt-4"
								size="sm"
								onClick={() => setClassroomPage(1)}
							>
								Volver a la página 1
							</Button>
						</div>
					) : (
						<>
							<ResponsiveTable<ClassroomAvailabilityRow>
								columns={COLUMNS}
								data={details.data?.rows ?? []}
								getRowKey={row => row.classroomId}
								loading={details.isPending}
								emptyMessage="No hay aulas para los filtros seleccionados"
							/>
							<PaginationControls
								page={classroomPage}
								totalPages={totalPages}
								onPageChange={setClassroomPage}
							/>
						</>
					)}
				</div>
			) : null}
		</div>
	);
};
