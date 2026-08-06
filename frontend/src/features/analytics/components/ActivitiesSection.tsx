import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAbility } from '@config';
import type { IResponsiveColumn } from '@shared/components';
import { Button, DataTable, PaginationControls } from '@shared/components';
import { downloadBlob, ESwalIcons, genericAlert } from '@shared/utils';
import { analyticsApi, useActivities, useActivityDetails, type ActivityDetailRow, type ActivityDetailSort } from '@api/analytics';
import { useAnalyticsFilters, type ActivityBreakdown } from '../hooks';
import { AnalyticsSummarySkeleton } from './AnalyticsSkeletons';
import { AnalyticsExportButton } from './AnalyticsExportButton';
import { DistributionBars } from './DistributionBars';
import { MetricCard } from './MetricCard';

const METRICS = [
	{ key: 'totalActivities', label: 'Actividades totales' },
	{ key: 'reportedTeachers', label: 'Docentes con reporte' },
	{ key: 'averageActivitiesPerReportedTeacher', label: 'Promedio por docente reportante' },
	{ key: 'activeTeacherReportCoverage', label: 'Cobertura de docentes activos' },
] satisfies { key: 'totalActivities' | 'reportedTeachers' | 'averageActivitiesPerReportedTeacher' | 'activeTeacherReportCoverage'; label: string }[];

const SORTS = [
	{ value: 'activityName:asc', label: 'Actividad A-Z' }, { value: 'activityName:desc', label: 'Actividad Z-A' },
	{ value: 'typeName:asc', label: 'Tipo A-Z' }, { value: 'typeName:desc', label: 'Tipo Z-A' },
	{ value: 'teacherName:asc', label: 'Docente A-Z' }, { value: 'teacherName:desc', label: 'Docente Z-A' },
	{ value: 'period:asc', label: 'Período ascendente' }, { value: 'period:desc', label: 'Período descendente' },
	{ value: 'progressLevel:asc', label: 'Progreso ascendente' }, { value: 'progressLevel:desc', label: 'Progreso descendente' },
] satisfies { value: ActivityDetailSort; label: string }[];

const registrationLabel = (value: boolean | null) => value === null ? 'Sin estado' : value ? 'Registrada' : 'No registrada';

const createColumns = (canViewReports: boolean): IResponsiveColumn<ActivityDetailRow>[] => [
	{ key: 'activity', header: 'Actividad', render: (row: ActivityDetailRow) => <div className="min-w-0 text-left"><p className="break-words font-semibold">{row.activityName}</p><p className="break-words text-xs text-muted-foreground">{row.activityType.name}</p></div> },
	{ key: 'teacher', header: 'Docente', render: (row: ActivityDetailRow) => <div><p>{row.teacher.name}</p><p className="text-xs text-muted-foreground">{row.teacher.code}</p></div> },
	{ key: 'period', header: 'Período', render: (row: ActivityDetailRow) => row.period.label },
	{ key: 'centerDepartment', header: 'Centro y departamento', render: (row: ActivityDetailRow) => row.centerDepartment.label },
	{ key: 'progressLevel', header: 'Nivel de progreso' },
	{ key: 'isRegistered', header: 'Registro', render: (row: ActivityDetailRow) => registrationLabel(row.isRegistered) },
	{
		key: 'assignmentReportId',
		header: 'Reporte de asignación',
		render: (row: ActivityDetailRow) => canViewReports ? (
			<Link
				to={`/academic/reports/coordinator/${row.assignmentReportId}`}
				className="font-medium text-primary underline-offset-2 hover:underline"
				title="Abrir reporte de asignación"
			>
				Ver reporte
			</Link>
		) : (
			<span title="No tienes permiso para ver este reporte de asignación.">
				<button
					type="button"
					disabled
					aria-label="No tienes permiso para ver este reporte de asignación"
					className="cursor-not-allowed rounded-md border border-border px-2 py-1 text-xs text-muted-foreground"
				>
					Sin permiso
				</button>
			</span>
		),
	},
];

export const ActivitiesSection = () => {
	const { activityFilters, activitySort, page, size, setPage, setActivitySort, setActivityBreakdown, values, options } = useAnalyticsFilters('activities');
	const ability = useAbility();
	const [isExporting, setIsExporting] = useState(false);
	const breakdown = values.activityBreakdown;
	const summary = useActivities(activityFilters);
	const details = useActivityDetails(activityFilters ? { ...activityFilters, metric: 'activities', page: String(page), size: String(size), sort: activitySort } : undefined);
	if (!activityFilters) return <p className="py-8 text-center text-sm text-muted-foreground">No hay una selección temporal autorizada para consultar.</p>;
	const totalPages = Math.ceil((details.data?.meta.total ?? 0) / (details.data?.meta.size ?? size));
	const outOfRange = Boolean(details.data && page > Math.max(totalPages, 1));
	const canViewReports = ability.can('read', 'reports') || ability.can('manage', 'reports');
	const columns = createColumns(canViewReports);
	const distribution = summary.data ? breakdown === 'type' ? summary.data.distributions.byType : breakdown === 'period' ? summary.data.distributions.byPeriod : breakdown === 'center' ? summary.data.distributions.byCenterDepartment : summary.data.distributions.byTeacher : [];
	const setBreakdown = (value: string) => {
		const nextValue: ActivityBreakdown = value === 'period' || value === 'center' || value === 'teacher' ? value : 'type';
		setActivityBreakdown(nextValue);
	};
	const exportRows = async () => {
		setIsExporting(true);
		try { const response = await analyticsApi.exportActivities({ ...activityFilters, metric: 'activities', sort: activitySort }); const temporal = activityFilters.periodId ?? activityFilters.year ?? 'seleccion'; downloadBlob(response.data, `analytics-actividades-${temporal}.xlsx`); }
		catch { await genericAlert('No fue posible exportar las actividades.', ESwalIcons.ERROR); }
		finally { setIsExporting(false); }
	};
	return <div>
		<div className="mb-5"><h2 className="text-xl font-semibold">Actividades complementarias</h2><p className="mt-1 text-sm text-muted-foreground">Las actividades se leen desde los reportes de asignación y su tipo se toma del catálogo vigente. Esta sección muestra lo registrado, pero no gestiona ni muestra estados de revisión o aprobación del reporte.</p></div>
		{summary.isError ? <p className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">No fue posible cargar los indicadores de actividades.</p> : summary.isPending ? <AnalyticsSummarySkeleton count={METRICS.length} gridClassName="sm:grid-cols-2 lg:grid-cols-4" showDistribution /> : <><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{METRICS.map(item => <MetricCard key={item.key} label={item.label} metric={summary.data.metrics[item.key]} />)}</div><div className="mt-8 rounded-xl border border-card-border p-4"><label className="text-sm font-semibold">Distribución<select value={breakdown} onChange={event => setBreakdown(event.target.value)} className="ml-3 min-h-10 rounded-lg border border-input bg-background px-3"><option value="type">Por tipo</option><option value="period">Por período</option><option value="center">Por centro y departamento</option><option value="teacher">Por docente</option></select></label><div className="mt-5"><DistributionBars items={distribution} /></div></div></>}
		<div className="mt-8 border-t border-border pt-6"><div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><h3 className="text-lg font-semibold">Detalle de actividades</h3><p className="text-xs text-muted-foreground">{details.data ? `${details.data.meta.total} actividades · una fila por actividad` : 'Detalle paginado'}</p></div><div className="flex flex-col gap-2 sm:flex-row sm:items-center"><label className="flex items-center gap-2 text-sm font-semibold"><span className="shrink-0">Ordenar por:</span><select value={activitySort} onChange={event => { const sort = SORTS.find(item => item.value === event.target.value); if (sort) setActivitySort(sort.value); }}>{SORTS.map(item => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>{options?.capabilities.canExport ? <AnalyticsExportButton onClick={exportRows} isExporting={isExporting} /> : null}</div></div>
		{details.isError ? <p className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">No fue posible cargar el detalle de actividades.</p> : outOfRange ? <div className="rounded-xl bg-muted p-6 text-center"><p>La página solicitada no está disponible.</p><Button className="mt-3" size="sm" onClick={() => setPage(1)}>Volver a página 1</Button></div> : <><DataTable columns={columns} data={details.data?.rows ?? []} getRowKey={row => row.id} loading={details.isPending} emptyMessage="No hay actividades para los filtros seleccionados" /><PaginationControls page={page} totalPages={totalPages} onPageChange={setPage} /></>}</div>
	</div>;
};
