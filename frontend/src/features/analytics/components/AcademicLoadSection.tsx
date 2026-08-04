import { useState } from 'react';
import { Loader2 } from 'lucide-react';
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
	useAcademicLoad,
	useAcademicLoadDetails,
	isAcademicLoadDetailSort,
	type AcademicLoadDetailRow,
	type AcademicLoadDetailSort,
	type AcademicLoadMetricKey,
	type AcademicLoadSummary,
} from '@api/analytics';
import { useAnalyticsFilters } from '../hooks';
import { MetricCard } from './MetricCard';

const METRICS: { key: AcademicLoadMetricKey; label: string }[] = [
	{ key: 'offeredSections', label: 'Secciones ofertadas' },
	{ key: 'distinctCourses', label: 'Asignaturas distintas' },
	{ key: 'assignedUvs', label: 'UV asignadas' },
	{ key: 'assignedTeachers', label: 'Docentes asignados' },
	{
		key: 'averageSectionsPerTeacher',
		label: 'Promedio secciones / docente',
	},
	{ key: 'averageUvsPerTeacher', label: 'Promedio UV / docente' },
];

const COLUMNS: IResponsiveColumn<AcademicLoadDetailRow>[] = [
	{ key: 'name', header: 'Docente' },
	{ key: 'code', header: 'Código' },
	{ key: 'sectionCount', header: 'Secciones' },
	{
		key: 'distinctCourseCount',
		header: 'Asignaturas distintas',
		mobileLabel: 'Asignaturas',
	},
	{ key: 'assignedUvs', header: 'UV' },
];

const SORT_OPTIONS: { value: AcademicLoadDetailSort; label: string }[] = [
	{ value: 'name:asc', label: 'Docente A-Z' },
	{ value: 'name:desc', label: 'Docente Z-A' },
	{ value: 'code:asc', label: 'Código ascendente' },
	{ value: 'code:desc', label: 'Código descendente' },
	{ value: 'sectionCount:desc', label: 'Más secciones' },
	{ value: 'sectionCount:asc', label: 'Menos secciones' },
	{ value: 'distinctCourseCount:desc', label: 'Más asignaturas' },
	{ value: 'distinctCourseCount:asc', label: 'Menos asignaturas' },
	{ value: 'assignedUvs:desc', label: 'Más UV' },
	{ value: 'assignedUvs:asc', label: 'Menos UV' },
];

const DAY_LABELS = {
	Lu: 'Lunes',
	Ma: 'Martes',
	Mi: 'Miércoles',
	Ju: 'Jueves',
	Vi: 'Viernes',
	Sa: 'Sábado',
	Do: 'Domingo',
};

const COVERAGE_REASON_LABELS = {
	invalid_schedule_days: 'Secciones con días de reunión inválidos',
	invalid_schedule_section: 'Secciones con un rango horario inválido',
};

const ScheduleDistribution = ({
	distribution,
}: {
	distribution: AcademicLoadSummary['scheduleDistribution'];
}) => {
	const meetingCount = distribution.items.reduce(
		(total, item) => total + item.meetingCount,
		0
	);
	const statusLabel =
		distribution.dataStatus === 'complete'
			? 'Completa'
			: distribution.dataStatus === 'partial'
				? 'Parcial'
				: 'No disponible';

	return (
		<section className="mt-8 rounded-xl border border-card-border bg-card p-4 sm:p-5" aria-labelledby="schedule-distribution-title">
			<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
				<div>
					<h3 id="schedule-distribution-title" className="text-lg font-semibold text-card-foreground">
						Reuniones por día y rango horario
					</h3>
					<p className="mt-1 text-sm text-muted-foreground">
						Distribución reportada por el plan académico, sin completar ni inferir horarios.
					</p>
				</div>
				<p className="w-fit rounded-full bg-primary-light px-3 py-1.5 text-sm font-semibold text-primary">
					{meetingCount} reunión{meetingCount === 1 ? '' : 'es'}
				</p>
			</div>

			<dl className="mt-4 grid gap-2 rounded-lg bg-muted p-3 text-sm sm:grid-cols-4">
				<div><dt className="text-xs text-muted-foreground">Calidad</dt><dd className="font-semibold">{statusLabel}</dd></div>
				<div><dt className="text-xs text-muted-foreground">Secciones incluidas</dt><dd className="font-semibold">{distribution.coverage.included}</dd></div>
				<div><dt className="text-xs text-muted-foreground">Secciones evaluadas</dt><dd className="font-semibold">{distribution.coverage.total}</dd></div>
				<div><dt className="text-xs text-muted-foreground">Secciones excluidas</dt><dd className="font-semibold">{distribution.coverage.excluded}</dd></div>
			</dl>

			{distribution.items.length > 0 ? (
				<ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3" aria-label="Distribución de reuniones">
					{distribution.items.map(item => (
						<li key={`${item.dayOfWeek}-${item.startTime}-${item.endTime}`} className="min-w-0 rounded-lg border border-border p-3">
							<p className="font-semibold text-foreground">{DAY_LABELS[item.dayOfWeek]}</p>
							<p className="text-sm text-muted-foreground">{item.startTime} a {item.endTime}</p>
							<p className="mt-2 text-sm font-semibold text-primary">{item.meetingCount} reunión{item.meetingCount === 1 ? '' : 'es'}</p>
						</li>
					))}
				</ul>
			) : (
				<p className="mt-4 rounded-lg border border-border bg-background p-4 text-sm text-muted-foreground">
					{distribution.coverage.total === 0
						? 'No hay secciones para distribuir con los filtros seleccionados.'
						: 'No hay reuniones con días y rangos horarios válidos para mostrar.'}
				</p>
			)}

			{distribution.coverage.reasons.length > 0 ? (
				<div className="mt-4 rounded-lg border border-warning/30 bg-warning/10 p-3 text-sm">
					<p className="font-semibold text-foreground">Motivos de exclusión</p>
					<ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
						{distribution.coverage.reasons.map(reason => (
							<li key={reason}>{COVERAGE_REASON_LABELS[reason]}</li>
						))}
					</ul>
				</div>
			) : null}
		</section>
	);
};

export const AcademicLoadSection = () => {
	const {
		academicLoadFilters,
		options,
		loadPage,
		size,
		loadSort,
		setLoadPage,
		setLoadSort,
	} = useAnalyticsFilters('academic-load');
	const [isExporting, setIsExporting] = useState(false);
	const summary = useAcademicLoad(academicLoadFilters);
	const details = useAcademicLoadDetails(
		academicLoadFilters
			? {
					...academicLoadFilters,
					metric: 'teacher_load',
					page: String(loadPage),
					size: String(size),
					sort: loadSort,
				}
			: undefined
	);

	if (!academicLoadFilters) {
		return (
			<p className="py-8 text-center text-sm text-muted-foreground">
				No hay un período académico autorizado para consultar.
			</p>
		);
	}
	const totalPages = Math.ceil(
		(details.data?.meta.total ?? 0) / (details.data?.meta.size ?? size)
	);
	const isPageOutOfRange = Boolean(
		details.data && loadPage > Math.max(totalPages, 1)
	);
	const handleSortChange = (value: string) => {
		if (isAcademicLoadDetailSort(value)) setLoadSort(value);
	};
	const handleExport = async () => {
		setIsExporting(true);
		try {
			const response = await analyticsApi.exportAcademicLoadDetails({
				periodId: academicLoadFilters.periodId,
				metric: 'teacher_load',
				...(academicLoadFilters.centerDepartmentId
					? { centerDepartmentId: academicLoadFilters.centerDepartmentId }
					: {}),
				...(academicLoadFilters.teacherId
					? { teacherId: academicLoadFilters.teacherId }
					: {}),
				sort: loadSort,
			});
			downloadBlob(
				response.data,
				`analytics-carga-academica-${academicLoadFilters.periodId}.xlsx`
			);
		} catch {
			await genericAlert(
				'No fue posible exportar el detalle de carga académica. Intenta nuevamente.',
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
					Carga académica
				</h2>
				<p className="mt-1 text-sm text-muted-foreground">
					Resumen consolidado del período seleccionado. Los indicadores no se
					recalculan desde el detalle.
				</p>
			</div>

			{summary.isError ? (
				<div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
					No fue posible cargar los indicadores de carga académica.
				</div>
			) : summary.isPending ? (
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{METRICS.map(metric => (
						<Skeleton key={metric.key} className="h-32 rounded-xl" />
					))}
				</div>
			) : (
				<>
					<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
						{METRICS.map(metric => (
							<MetricCard
								key={metric.key}
								label={metric.label}
								metric={summary.data.metrics[metric.key]}
							/>
						))}
					</div>
					<ScheduleDistribution distribution={summary.data.scheduleDistribution} />
				</>
			)}

			<div className="mt-8 border-t border-border pt-6">
				<div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
					<div>
						<h3 className="text-lg font-semibold text-card-foreground">
							Carga por docente
						</h3>
						<p className="text-xs text-muted-foreground">
							{details.data
								? `${details.data.meta.total} docente${details.data.meta.total === 1 ? '' : 's'}`
								: 'Detalle paginado'}
						</p>
					</div>
					<div className="flex flex-col gap-2 sm:flex-row sm:items-end">
						<label className="text-sm font-semibold text-foreground">
							<span className="mb-1 block">Ordenar por</span>
							<select
								value={loadSort}
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
						No fue posible cargar el detalle por docente.
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
						<Button className="mt-4" size="sm" onClick={() => setLoadPage(1)}>
							Volver a la página 1
						</Button>
					</div>
				) : (
					<>
						<ResponsiveTable<AcademicLoadDetailRow>
							columns={COLUMNS}
							data={details.data?.rows ?? []}
							getRowKey={row => row.teacherId}
							loading={details.isPending}
							emptyMessage="No hay carga docente para los filtros seleccionados"
						/>
						<PaginationControls
							page={loadPage}
							totalPages={totalPages}
							onPageChange={setLoadPage}
						/>
					</>
				)}
			</div>
		</div>
	);
};
