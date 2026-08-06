import { useState } from 'react';
import { AlertTriangle, CheckCircle2, CircleHelp } from 'lucide-react';
import type { IResponsiveColumn } from '@shared/components';
import { Button, DataTable, PaginationControls } from '@shared/components';
import { downloadBlob, ESwalIcons, genericAlert } from '@shared/utils';
import {
	analyticsApi,
	isClassroomCapacitySort,
	useClassroomCapacity,
	useClassroomCapacityDetails,
	type ClassroomCapacityRow,
	type ClassroomCapacitySort,
} from '@api/analytics';
import { useAnalyticsFilters } from '../hooks';
import { AnalyticsSummarySkeleton } from './AnalyticsSkeletons';
import { AnalyticsExportButton } from './AnalyticsExportButton';
import { MetricCard } from './MetricCard';

const SORTS = [
	{ value: 'classroomName:asc', label: 'Aula A-Z' }, { value: 'classroomName:desc', label: 'Aula Z-A' },
	{ value: 'buildingName:asc', label: 'Edificio A-Z' }, { value: 'buildingName:desc', label: 'Edificio Z-A' },
	{ value: 'maxCapacity:desc', label: 'Mayor capacidad' }, { value: 'maxCapacity:asc', label: 'Menor capacidad' },
	{ value: 'capacityStatus:asc', label: 'Estado ascendente' }, { value: 'capacityStatus:desc', label: 'Estado descendente' },
] satisfies { value: ClassroomCapacitySort; label: string }[];

const CapacityStatus = ({ row }: { row: ClassroomCapacityRow }) => {
	if (row.capacityStatus === 'known') return <span className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary-light px-2 py-1 text-xs font-semibold text-primary"><CheckCircle2 className="size-3" />Conocida</span>;
	if (row.capacityStatus === 'invalid') return <span className="inline-flex items-center gap-1 rounded-full border border-destructive/30 bg-destructive/10 px-2 py-1 text-xs font-semibold text-destructive"><AlertTriangle className="size-3" />Inválida</span>;
	return <span className="inline-flex items-center gap-1 rounded-full border border-border bg-muted px-2 py-1 text-xs font-semibold text-muted-foreground"><CircleHelp className="size-3" />Faltante</span>;
};

const COLUMNS = [
	{ key: 'classroomName', header: 'Aula' },
	{ key: 'buildingName', header: 'Edificio' },
	{ key: 'centerName', header: 'Centro' },
	{ key: 'roomType', header: 'Tipo de aula' },
	{ key: 'maxCapacity', header: 'Capacidad máxima', render: (row: ClassroomCapacityRow) => row.maxCapacity ?? 'Sin información' },
	{ key: 'capacityStatus', header: 'Estado', render: (row: ClassroomCapacityRow) => <CapacityStatus row={row} /> },
] satisfies IResponsiveColumn<ClassroomCapacityRow>[];

export const ClassroomCapacitySection = () => {
	const { classroomCapacityFilters, page, size, capacitySort, setPage, setCapacitySort, options } = useAnalyticsFilters('classrooms');
	const [isExporting, setIsExporting] = useState(false);
	const summary = useClassroomCapacity(classroomCapacityFilters);
	const details = useClassroomCapacityDetails(classroomCapacityFilters ? { ...classroomCapacityFilters, metric: 'installed_capacity', page: String(page), size: String(size), sort: capacitySort } : undefined);
	if (!classroomCapacityFilters) return <p className="py-8 text-center text-sm text-muted-foreground">No hay un período académico autorizado para consultar.</p>;
	const totalPages = Math.ceil((details.data?.meta.total ?? 0) / (details.data?.meta.size ?? size));
	const outOfRange = Boolean(details.data && page > Math.max(totalPages, 1));
	const exportRows = async () => {
		setIsExporting(true);
		try {
			const response = await analyticsApi.exportClassroomCapacityDetails({ ...classroomCapacityFilters, metric: 'installed_capacity', sort: capacitySort });
			downloadBlob(response.data, `analytics-capacidad-aulas-${classroomCapacityFilters.periodId}.xlsx`);
		} catch {
			await genericAlert('No fue posible exportar la capacidad instalada.', ESwalIcons.ERROR);
		} finally { setIsExporting(false); }
	};
	return (
		<div>
			<div className="mb-5"><h2 className="text-xl font-semibold text-card-foreground">Capacidad instalada</h2><p className="mt-1 text-sm text-muted-foreground">Capacidad y calidad de datos del catálogo actual de aulas.</p></div>
		{summary.isError ? <p className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">No fue posible cargar la capacidad instalada.</p> : summary.isPending ? <AnalyticsSummarySkeleton count={2} gridClassName="sm:grid-cols-2" /> : <div className="grid gap-4 sm:grid-cols-2"><MetricCard label="Capacidad instalada" metric={summary.data.metrics.installedCapacity} /><MetricCard label="Cobertura de datos de capacidad" metric={summary.data.metrics.capacityDataCoverage} /></div>}
		<div className="mt-8 border-t border-border pt-6">
			<div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><h3 className="text-lg font-semibold text-card-foreground">Todas las aulas</h3><p className="text-xs text-muted-foreground">{details.data ? `${details.data.meta.total} aulas · capacidad y catálogo actuales` : 'Detalle paginado'}</p></div><div className="flex flex-col gap-2 sm:flex-row sm:items-center"><label className="flex items-center gap-2 text-sm font-semibold"><span className="shrink-0">Ordenar por:</span><select value={capacitySort} onChange={event => { if (isClassroomCapacitySort(event.target.value)) setCapacitySort(event.target.value); }}>{SORTS.map(item => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>{options?.capabilities.canExport ? <AnalyticsExportButton onClick={exportRows} isExporting={isExporting} /> : null}</div></div>
			{details.isError ? <p className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">No fue posible cargar el detalle de aulas.</p> : outOfRange ? <div className="rounded-xl bg-muted p-6 text-center"><p>La página solicitada no está disponible.</p><Button className="mt-3" size="sm" onClick={() => setPage(1)}>Volver a página 1</Button></div> : <><DataTable columns={COLUMNS} data={details.data?.rows ?? []} getRowKey={row => row.classroomId} loading={details.isPending} emptyMessage="No hay aulas para los filtros seleccionados" /><PaginationControls page={page} totalPages={totalPages} onPageChange={setPage} /></>}
		</div></div>
	);
};
