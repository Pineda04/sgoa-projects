import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import type { IResponsiveColumn } from '@shared/components';
import { Button, PaginationControls, ResponsiveTable, Skeleton } from '@shared/components';
import { downloadBlob, ESwalIcons, genericAlert } from '@shared/utils';
import { analyticsApi, useStaff, useStaffDetails, type StaffDetailRow, type StaffDetailSort } from '@api/analytics';
import { useAnalyticsFilters, type StaffBreakdown } from '../hooks';
import { DistributionBars } from './DistributionBars';
import { MetricCard } from './MetricCard';

const SORTS = [
	{ value: 'name:asc', label: 'Nombre A-Z' }, { value: 'name:desc', label: 'Nombre Z-A' },
	{ value: 'code:asc', label: 'Código ascendente' }, { value: 'code:desc', label: 'Código descendente' },
	{ value: 'contractName:asc', label: 'Contrato A-Z' }, { value: 'contractName:desc', label: 'Contrato Z-A' },
	{ value: 'categoryName:asc', label: 'Categoría A-Z' }, { value: 'categoryName:desc', label: 'Categoría Z-A' },
	{ value: 'shiftName:asc', label: 'Jornada A-Z' }, { value: 'shiftName:desc', label: 'Jornada Z-A' },
] satisfies { value: StaffDetailSort; label: string }[];

const formatDate = (value: string | null) => value ? new Intl.DateTimeFormat('es-HN', { dateStyle: 'medium' }).format(new Date(value)) : 'Vigente';

const COLUMNS = [
	{ key: 'teacher', header: 'Docente', render: (row: StaffDetailRow) => <div className="text-left"><p className="font-semibold">{row.name}</p><p className="text-xs text-muted-foreground">{row.code}</p></div> },
	{ key: 'contractType', header: 'Contrato', render: (row: StaffDetailRow) => row.contractType.name },
	{ key: 'category', header: 'Categoría', render: (row: StaffDetailRow) => row.category.name },
	{ key: 'shift', header: 'Jornada', render: (row: StaffDetailRow) => <div><p>{row.shift.name}</p><p className="text-xs text-muted-foreground">{row.shiftStart ? new Date(row.shiftStart).toLocaleTimeString('es-HN', { hour: '2-digit', minute: '2-digit' }) : 'Sin inicio'} - {row.shiftEnd ? new Date(row.shiftEnd).toLocaleTimeString('es-HN', { hour: '2-digit', minute: '2-digit' }) : 'Sin fin'}</p></div> },
	{ key: 'currentPositions', header: 'Cargos vigentes', render: (row: StaffDetailRow) => row.currentPositions.length ? <div className="min-w-0 space-y-2 text-left">{row.currentPositions.map(position => <div key={`${position.position.id}-${position.centerDepartment.id}`} className="rounded-md border border-border bg-background p-2"><p className="font-semibold">{position.position.name}</p><p className="break-words text-xs text-muted-foreground">{position.centerDepartment.label}</p><p className="text-xs text-muted-foreground">{formatDate(position.startDate)} - {formatDate(position.endDate)}</p></div>)}</div> : <span className="text-muted-foreground">Sin cargo académico vigente</span> },
] satisfies IResponsiveColumn<StaffDetailRow>[];

export const StaffSection = () => {
	const [searchParams, setSearchParams] = useSearchParams();
	const { staffFilters, staffSort, page, size, setPage, setStaffSort, options } = useAnalyticsFilters('staff');
	const [isExporting, setIsExporting] = useState(false);
	const rawBreakdown = searchParams.get('staffBreakdown');
	const breakdown: StaffBreakdown = rawBreakdown === 'category' || rawBreakdown === 'shift' || rawBreakdown === 'position' ? rawBreakdown : 'contract';
	const summary = useStaff(staffFilters);
	const details = useStaffDetails(staffFilters ? { ...staffFilters, metric: 'staff_current', page: String(page), size: String(size), sort: staffSort } : undefined);
	if (!staffFilters) return <p className="py-8 text-center text-sm text-muted-foreground">No hay un alcance autorizado de personal para consultar.</p>;
	const totalPages = Math.ceil((details.data?.meta.total ?? 0) / (details.data?.meta.size ?? size));
	const outOfRange = Boolean(details.data && page > Math.max(totalPages, 1));
	const distribution = summary.data ? breakdown === 'contract' ? summary.data.distributions.byContract : breakdown === 'category' ? summary.data.distributions.byCategory : breakdown === 'shift' ? summary.data.distributions.byShift : summary.data.distributions.byCurrentPosition : [];
	const setBreakdown = (value: string) => {
		const nextValue: StaffBreakdown = value === 'category' || value === 'shift' || value === 'position' ? value : 'contract';
		setSearchParams(current => { const next = new URLSearchParams(current); next.set('staffBreakdown', nextValue); return next; });
	};
	const exportRows = async () => {
		setIsExporting(true);
		try { const response = await analyticsApi.exportStaff({ ...staffFilters, metric: 'staff_current', sort: staffSort }); downloadBlob(response.data, 'analytics-personal-actual.xlsx'); }
		catch { await genericAlert('No fue posible exportar el personal actual.', ESwalIcons.ERROR); }
		finally { setIsExporting(false); }
	};
	return <div>
		<div className="mb-5"><h2 className="text-xl font-semibold">Personal</h2><p className="mt-1 text-sm text-muted-foreground">Personal activo con atributos actuales y cargos del catálogo vigente al momento de la consulta.</p>{summary.data ? <p className="mt-1 text-xs text-muted-foreground">Corte: {new Date(summary.data.asOf).toLocaleString('es-HN')}</p> : null}</div>
		{summary.isError ? <p className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">No fue posible cargar los indicadores de personal.</p> : summary.isPending ? <Skeleton className="h-36 rounded-xl" /> : <><div className="max-w-md"><MetricCard label="Docentes activos" metric={summary.data.metrics.activeTeachers} /></div><div className="mt-8 rounded-xl border border-card-border p-4"><label className="text-sm font-semibold">Distribución<select value={breakdown} onChange={event => setBreakdown(event.target.value)} className="ml-3 min-h-10 rounded-lg border border-input bg-background px-3"><option value="contract">Por contrato</option><option value="category">Por categoría</option><option value="shift">Por jornada</option><option value="position">Por cargo vigente</option></select></label>{breakdown === 'position' ? <p className="mt-3 rounded-lg bg-muted p-3 text-xs text-muted-foreground">Los cargos son multivaluados: un docente puede ocupar más de uno y los porcentajes pueden sumar más de 100%.</p> : null}<div className="mt-5"><DistributionBars items={distribution} /></div></div></>}
		<div className="mt-8 border-t border-border pt-6"><div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><h3 className="text-lg font-semibold">Detalle por docente</h3><p className="text-xs text-muted-foreground">{details.data ? `${details.data.meta.total} docentes · atributos y cargos actuales` : 'Detalle paginado'}</p></div><div className="flex flex-col gap-2 sm:flex-row"><label className="text-sm font-semibold">Orden<select value={staffSort} onChange={event => { const sort = SORTS.find(item => item.value === event.target.value); if (sort) setStaffSort(sort.value); }} className="mt-1 block min-h-10 rounded-lg border border-input bg-background px-3">{SORTS.map(item => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>{options?.capabilities.canExport ? <Button onClick={exportRows} disabled={isExporting}>{isExporting ? <Loader2 className="size-4 animate-spin" /> : null}{isExporting ? 'Exportando...' : 'Exportar Excel'}</Button> : null}</div></div>
		{details.isError ? <p className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">No fue posible cargar el detalle de personal.</p> : outOfRange ? <div className="rounded-xl bg-muted p-6 text-center"><p>La página solicitada no está disponible.</p><Button className="mt-3" size="sm" onClick={() => setPage(1)}>Volver a página 1</Button></div> : <><ResponsiveTable columns={COLUMNS} data={details.data?.rows ?? []} getRowKey={row => row.teacherId} loading={details.isPending} emptyMessage="No hay personal para los filtros seleccionados" /><PaginationControls page={page} totalPages={totalPages} onPageChange={setPage} /></>}</div>
	</div>;
};
