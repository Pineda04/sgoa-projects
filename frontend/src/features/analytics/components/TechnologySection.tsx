import { useState } from 'react';
import type { IResponsiveColumn } from '@shared/components';
import { Button, DataTable, PaginationControls } from '@shared/components';
import { downloadBlob, ESwalIcons, genericAlert } from '@shared/utils';
import {
	analyticsApi,
	useTechnology,
	useTechnologyDetails,
	type TechnologyDetailMetric,
	type TechnologyDetailRow,
	type TechnologyDetailSort,
} from '@api/analytics';
import { useAnalyticsFilters, type TechnologyBreakdown } from '../hooks';
import { AnalyticsSummarySkeleton } from './AnalyticsSkeletons';
import { AnalyticsExportButton } from './AnalyticsExportButton';
import { DistributionBars } from './DistributionBars';
import { MetricCard } from './MetricCard';

const METRICS = [
	{
		key: 'eligibleClassrooms',
		label: 'Aulas elegibles',
		description: 'Aulas físicas activas incluidas en el centro y departamento seleccionados.',
	},
	{
		key: 'equippedClassrooms',
		label: 'Aulas con pizarra digital',
		description: 'Aulas elegibles que tienen al menos una pizarra digital inventariada.',
	},
	{
		key: 'digitalBlackboardCoverage',
		label: 'Cobertura de pizarras digitales',
		description: 'Porcentaje de aulas elegibles que tienen pizarra digital. No mide si la pizarra se usa.',
	},
	{
		key: 'knownEnrollmentsInEquippedClassrooms',
		label: 'Matrícula reportada en aulas con pizarra',
		description: 'Suma de matrículas reportadas en secciones físicas ubicadas en aulas con pizarra.',
	},
	{
		key: 'equippedEnrollmentDataCoverage',
		label: 'Cobertura de matrícula en aulas con pizarra',
		description: 'Porcentaje de esas secciones que sí tienen matrícula reportada.',
	},
	{
		key: 'totalEquipment',
		label: 'Equipos inventariados',
		description: 'Total de pizarras, computadoras y aires acondicionados vinculados a las aulas elegibles.',
	},
] satisfies {
	key:
		| 'eligibleClassrooms'
		| 'equippedClassrooms'
		| 'digitalBlackboardCoverage'
		| 'knownEnrollmentsInEquippedClassrooms'
		| 'equippedEnrollmentDataCoverage'
		| 'totalEquipment';
	label: string;
	description: string;
}[];

const DETAIL_METRICS = [
	{ value: 'equipped_classrooms', label: 'Aulas con pizarra digital' },
	{ value: 'equipped_classroom_enrollment', label: 'Matrícula en aulas con pizarra' },
	{ value: 'equipment_inventory', label: 'Equipos inventariados' },
] satisfies { value: TechnologyDetailMetric; label: string }[];

const SORTS: Record<TechnologyDetailMetric, { value: TechnologyDetailSort; label: string }[]> = {
	equipped_classrooms: [
		{ value: 'classroomName:asc', label: 'Aula A-Z' }, { value: 'classroomName:desc', label: 'Aula Z-A' },
		{ value: 'buildingName:asc', label: 'Edificio A-Z' }, { value: 'buildingName:desc', label: 'Edificio Z-A' },
		{ value: 'digitalBlackboardCount:desc', label: 'Más pizarras' }, { value: 'digitalBlackboardCount:asc', label: 'Menos pizarras' },
		{ value: 'equipped:desc', label: 'Equipadas primero' }, { value: 'equipped:asc', label: 'No equipadas primero' },
	],
	equipped_classroom_enrollment: [
		{ value: 'courseCode:asc', label: 'Código ascendente' }, { value: 'courseCode:desc', label: 'Código descendente' },
		{ value: 'teacherName:asc', label: 'Docente A-Z' }, { value: 'teacherName:desc', label: 'Docente Z-A' },
		{ value: 'classroomName:asc', label: 'Aula A-Z' }, { value: 'classroomName:desc', label: 'Aula Z-A' },
		{ value: 'studentCount:desc', label: 'Mayor matrícula' }, { value: 'studentCount:asc', label: 'Menor matrícula' },
	],
	equipment_inventory: [
		{ value: 'equipmentType:asc', label: 'Tipo A-Z' }, { value: 'equipmentType:desc', label: 'Tipo Z-A' },
		{ value: 'conditionLabel:asc', label: 'Condición A-Z' }, { value: 'conditionLabel:desc', label: 'Condición Z-A' },
		{ value: 'classroomName:asc', label: 'Aula A-Z' }, { value: 'classroomName:desc', label: 'Aula Z-A' },
		{ value: 'buildingName:asc', label: 'Edificio A-Z' }, { value: 'buildingName:desc', label: 'Edificio Z-A' },
	],
};

const COLUMNS = [
	{ key: 'main', header: 'Registro', render: (row: TechnologyDetailRow) => row.rowType === 'equipped_classroom' ? <div className="text-left"><p className="font-semibold">{row.classroomName}</p><p className="text-xs text-muted-foreground">{row.roomType}</p></div> : row.rowType === 'equipped_classroom_enrollment' ? <div className="text-left"><p className="font-semibold">{row.courseName}</p><p className="text-xs text-muted-foreground">{row.courseCode} · Grupo {row.groupCode}</p></div> : <div className="text-left"><p className="font-semibold">{row.equipmentType}</p><p className="text-xs text-muted-foreground">{row.itemLabel ?? 'Sin etiqueta'}</p></div> },
	{ key: 'location', header: 'Ubicación', render: (row: TechnologyDetailRow) => row.rowType === 'equipped_classroom_enrollment' ? row.classroomName : <div><p>{row.classroomName}</p><p className="text-xs text-muted-foreground">{row.buildingName} · {row.centerName}</p></div> },
	{ key: 'detail', header: 'Detalle', render: (row: TechnologyDetailRow) => row.rowType === 'equipped_classroom' ? `${row.digitalBlackboardCount} pizarra${row.digitalBlackboardCount === 1 ? '' : 's'} · ${row.equipped ? 'Equipada' : 'No equipada'}` : row.rowType === 'equipped_classroom_enrollment' ? <div><p>{row.teacherName}</p><p className="text-xs text-muted-foreground">{row.studentCount === null ? 'Matrícula faltante' : `${row.studentCount} matrículas`}</p></div> : row.conditionLabel },
] satisfies IResponsiveColumn<TechnologyDetailRow>[];

const rowKey = (row: TechnologyDetailRow) => row.rowType === 'equipment_inventory' ? row.equipmentKey : row.rowType === 'equipped_classroom_enrollment' ? row.sectionId : row.classroomId;

export const TechnologySection = () => {
	const { technologyFilters, technologyMetric, technologySort, page, size, setPage, setTechnologyMetric, setTechnologySort, setTechnologyBreakdown, values, options } = useAnalyticsFilters('technology');
	const [isExporting, setIsExporting] = useState(false);
	const breakdown = values.technologyBreakdown;
	const summary = useTechnology(technologyFilters);
	const details = useTechnologyDetails(technologyFilters ? { ...technologyFilters, metric: technologyMetric, page: String(page), size: String(size), sort: technologySort } : undefined);
	if (!technologyFilters) return <p className="py-8 text-center text-sm text-muted-foreground">No hay un período académico autorizado para consultar.</p>;
	const totalPages = Math.ceil((details.data?.meta.total ?? 0) / (details.data?.meta.size ?? size));
	const outOfRange = Boolean(details.data && page > Math.max(totalPages, 1));
	const distribution = summary.data ? breakdown === 'type' ? summary.data.distributions.equipmentByType : breakdown === 'condition' ? summary.data.distributions.equipmentByCondition : summary.data.distributions.equipmentByBuilding : undefined;
	const setBreakdown = (value: string) => {
		const nextValue: TechnologyBreakdown = value === 'condition' || value === 'building' ? value : 'type';
		setTechnologyBreakdown(nextValue);
	};
	const exportRows = async () => {
		setIsExporting(true);
		try { const response = await analyticsApi.exportTechnologyDetails({ ...technologyFilters, metric: technologyMetric, sort: technologySort }); downloadBlob(response.data, `analytics-tecnologia-${technologyFilters.periodId}-${technologyMetric}.xlsx`); }
		catch { await genericAlert('No fue posible exportar el detalle de tecnología.', ESwalIcons.ERROR); }
		finally { setIsExporting(false); }
	};
	return <div>
		<div className="mb-5"><h2 className="text-xl font-semibold text-card-foreground">Tecnología</h2><p className="mt-1 text-sm text-muted-foreground">Inventario actual de equipos y aulas con pizarra digital. La matrícula se suma por sección, no por estudiante único.</p></div>
		{summary.isError ? <p className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">No fue posible cargar los indicadores de tecnología.</p> : summary.isPending ? <AnalyticsSummarySkeleton count={METRICS.length} showDistribution /> : <><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{METRICS.map(item => <MetricCard key={item.key} label={item.label} metric={summary.data.metrics[item.key]} description={item.description} showNotes={false} />)}</div><div className="mt-8 rounded-xl border border-card-border p-4"><label className="text-sm font-semibold">Distribución<select value={breakdown} onChange={event => setBreakdown(event.target.value)} className="ml-3 min-h-10 rounded-lg border border-input bg-background px-3"><option value="type">Por tipo</option><option value="condition">Por condición</option><option value="building">Por edificio</option></select></label><p className="mt-3 text-xs text-muted-foreground">Base: {distribution?.denominator ?? 0} equipos · Estado: {distribution?.dataStatus === 'complete' ? 'completa' : 'no aplica'}</p><div className="mt-5"><DistributionBars items={distribution?.items ?? []} /></div></div></>}
		<div className="mt-8 border-t border-border pt-6"><div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between"><div><h3 className="text-lg font-semibold">{DETAIL_METRICS.find(item => item.value === technologyMetric)?.label}</h3><p className="text-xs text-muted-foreground">{details.data ? `${details.data.meta.total} registros · catálogo e inventario actuales` : 'Detalle paginado'}</p>{technologyMetric === 'equipped_classrooms' ? <p className="mt-1 max-w-2xl text-xs text-muted-foreground">Incluye todas las aulas elegibles, con y sin pizarra, para comprobar la base del porcentaje. El indicador de aulas con pizarra usa las que tienen al menos una.</p> : null}</div><div className="flex shrink-0 flex-col gap-3 sm:flex-row sm:items-center"><label className="flex shrink-0 items-center gap-2 text-sm font-semibold"><span className="shrink-0">Detalle:</span><select value={technologyMetric} onChange={event => { const metric = DETAIL_METRICS.find(item => item.value === event.target.value); if (metric) setTechnologyMetric(metric.value); }}>{DETAIL_METRICS.map(item => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label><label className="flex shrink-0 items-center gap-2 text-sm font-semibold"><span className="shrink-0">Ordenar por:</span><select value={technologySort} onChange={event => { const sort = SORTS[technologyMetric].find(item => item.value === event.target.value); if (sort) setTechnologySort(sort.value); }}>{SORTS[technologyMetric].map(item => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>{options?.capabilities.canExport ? <AnalyticsExportButton onClick={exportRows} isExporting={isExporting} /> : null}</div></div>
		{details.isError ? <p className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">No fue posible cargar el detalle de tecnología.</p> : outOfRange ? <div className="rounded-xl bg-muted p-6 text-center"><p>La página solicitada no está disponible.</p><Button className="mt-3" size="sm" onClick={() => setPage(1)}>Volver a página 1</Button></div> : <><DataTable columns={COLUMNS} data={details.data?.rows ?? []} getRowKey={rowKey} loading={details.isPending} emptyMessage="No hay registros para los filtros seleccionados" /><PaginationControls page={page} totalPages={totalPages} onPageChange={setPage} /></>}</div>
	</div>;
};
