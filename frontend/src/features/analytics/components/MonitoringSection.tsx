import { useState } from 'react';
import type { IResponsiveColumn } from '@shared/components';
import { PaginationControls, DataTable } from '@shared/components';
import { downloadBlob, ESwalIcons, genericAlert } from '@shared/utils';
import {
	analyticsApi,
	useMonitoring,
	useMonitoringDetails,
	type AnalyticsDistributionItem,
	type MonitoringDetailMetric,
	type MonitoringDetailRow,
	type MonitoringDetailSort,
} from '@api/analytics';
import { useAnalyticsFilters } from '../hooks';
import { AnalyticsSummarySkeleton } from './AnalyticsSkeletons';
import { AnalyticsExportButton } from './AnalyticsExportButton';
import { DistributionBars } from './DistributionBars';
import { MetricCard } from './MetricCard';

const METRICS = [
	{ key: 'totalChecks', label: 'Chequeos' },
	{ key: 'presentChecks', label: 'Presentes' },
	{ key: 'absentChecks', label: 'Ausentes' },
	{ key: 'complianceRate', label: 'Cumplimiento' },
	{ key: 'observedBlackboardUseRate', label: 'Uso observado de pizarra' },
	{
		key: 'blackboardObservationCoverage',
		label: 'Cobertura de observación de pizarra',
	},
] satisfies {
	key:
		| 'totalChecks'
		| 'presentChecks'
		| 'absentChecks'
		| 'complianceRate'
		| 'observedBlackboardUseRate'
		| 'blackboardObservationCoverage';
	label: string;
}[];

const DETAIL_METRICS = [
	{ value: 'monitoring_checks', label: 'Todos los chequeos' },
	{ value: 'digital_blackboard_use', label: 'Uso observado de pizarra' },
] satisfies { value: MonitoringDetailMetric; label: string }[];

const SORTS = [
	{ value: 'checkDate:desc', label: 'Más recientes' },
	{ value: 'checkDate:asc', label: 'Más antiguos' },
	{ value: 'teacherName:asc', label: 'Docente A-Z' },
	{ value: 'teacherName:desc', label: 'Docente Z-A' },
	{ value: 'buildingName:asc', label: 'Edificio A-Z' },
	{ value: 'buildingName:desc', label: 'Edificio Z-A' },
] satisfies { value: MonitoringDetailSort; label: string }[];

const COLUMNS = [
	{
		key: 'date',
		header: 'Fecha y hora',
		render: (row: MonitoringDetailRow) => (
			<div>
				<p className="font-semibold">{row.checkDate.slice(0, 10)}</p>
				<p className="text-xs text-muted-foreground">{row.checkTime}</p>
			</div>
		),
	},
	{
		key: 'course',
		header: 'Clase',
		render: (row: MonitoringDetailRow) => (
			<div>
				<p className="font-semibold">{row.courseName}</p>
				<p className="text-xs text-muted-foreground">
					{row.courseCode} · Grupo {row.groupCode} · {row.teacherName}
				</p>
			</div>
		),
	},
	{
		key: 'location',
		header: 'Ubicación',
		render: (row: MonitoringDetailRow) => (
			<div>
				<p>{row.classroomName}</p>
				<p className="text-xs text-muted-foreground">
					{row.buildingName} · {row.centerName}
				</p>
			</div>
		),
	},
	{
		key: 'result',
		header: 'Resultado',
		render: (row: MonitoringDetailRow) => (
			<div>
				<p>{row.isPresent ? 'Presente' : 'Ausente'}</p>
				<p className="text-xs text-muted-foreground">
					{row.digitalBlackboardUseStatus === 'USED'
						? 'Pizarra usada'
						: row.digitalBlackboardUseStatus === 'NOT_USED'
							? 'Pizarra no usada'
							: row.digitalBlackboardUseStatus === 'UNKNOWN'
								? 'Uso desconocido'
								: 'Sin captura de pizarra'}
				</p>
			</div>
		),
	},
] satisfies IResponsiveColumn<MonitoringDetailRow>[];

export const MonitoringSection = () => {
	const {
		monitoringFilters,
		monitoringMetric,
		monitoringSort,
		values,
		page,
		size,
		setPage,
		setMonitoringMetric,
		setMonitoringSort,
		setMonitoringBreakdown,
		options,
	} = useAnalyticsFilters('monitoring');
	const [isExporting, setIsExporting] = useState(false);
	const summary = useMonitoring(monitoringFilters);
	const details = useMonitoringDetails(
		monitoringFilters
			? {
					...monitoringFilters,
					metric: monitoringMetric,
					page: String(page),
					size: String(size),
					sort: monitoringSort,
				}
			: undefined
	);

	if (!monitoringFilters) {
		return (
			<p className="py-8 text-center text-sm text-muted-foreground">
				El rango de fechas o el alcance autorizado no es válido.
			</p>
		);
	}

	const distributions = summary.data?.distributions;
	const grouped =
		values.monitoringBreakdown === 'teacher'
			? distributions?.byTeacher
			: values.monitoringBreakdown === 'building'
				? distributions?.byBuilding
				: values.monitoringBreakdown === 'center'
					? distributions?.byCenter
					: values.monitoringBreakdown === 'centerDepartment'
						? distributions?.byCenterDepartment
						: values.monitoringBreakdown === 'period'
							? distributions?.byPeriod
							: distributions?.byDay;
	const distributionItems: AnalyticsDistributionItem[] = (grouped ?? []).map(
		item => ({
			id: item.id,
			label: item.label,
			value: item.totalChecks,
			percentage: item.complianceRate,
		})
	);
	const totalPages = Math.ceil(
		(details.data?.meta.total ?? 0) / (details.data?.meta.size ?? size)
	);

	const exportRows = async () => {
		setIsExporting(true);
		try {
			const response = await analyticsApi.exportMonitoring({
				...monitoringFilters,
				metric: monitoringMetric,
				sort: monitoringSort,
			});
			downloadBlob(
				response.data,
				`analytics-monitoreo-${monitoringMetric}.xlsx`
			);
		} catch {
			await genericAlert(
				'No fue posible exportar el detalle de monitoreo.',
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
					Monitoreo
				</h2>
				<p className="mt-1 text-sm text-muted-foreground">
					Cumplimiento observado y uso de pizarra en chequeos
					autorizados. Los registros legados sin captura no se
					clasifican como no usados.
				</p>
			</div>
			{summary.isPending ? (
				<AnalyticsSummarySkeleton
					count={METRICS.length}
					showDistribution
				/>
			) : summary.isError ? (
				<p className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
					No fue posible cargar los indicadores de monitoreo.
				</p>
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
					<div className="mt-8 rounded-xl border border-card-border p-4">
						<label className="text-sm font-semibold">
							Cumplimiento por
							<select
								value={values.monitoringBreakdown}
								onChange={event => {
									const option = [
										'day',
										'teacher',
										'building',
										'center',
										'centerDepartment',
										'period',
									].find(
										value => value === event.target.value
									);
									if (
										option === 'day' ||
										option === 'teacher' ||
										option === 'building' ||
										option === 'center' ||
										option === 'centerDepartment' ||
										option === 'period'
									)
										setMonitoringBreakdown(option);
								}}
								className="ml-3 min-h-10 rounded-lg border border-input bg-background px-3"
							>
								<option value="day">Día</option>
								<option value="teacher">Docente</option>
								<option value="building">Edificio</option>
								<option value="center">Centro</option>
								<option value="centerDepartment">
									Carrera
								</option>
								<option value="period">Período</option>
							</select>
						</label>
						<div className="mt-5">
							<DistributionBars items={distributionItems} />
						</div>
					</div>
				</>
			)}

			<div className="mt-8 border-t border-border pt-6">
				<div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
					<div>
						<h3 className="text-lg font-semibold">
							Detalle auditable
						</h3>
						<p className="text-xs text-muted-foreground">
							{details.data?.meta.total ?? 0} registros
						</p>
					</div>
					<div className="flex flex-col gap-2 sm:flex-row sm:items-center">
						<label className="flex items-center gap-2 text-sm font-semibold">
							<span className="shrink-0">Detalle:</span>
							<select
								value={monitoringMetric}
								onChange={event => {
									const metric = DETAIL_METRICS.find(
										item =>
											item.value === event.target.value
									);
									if (metric)
										setMonitoringMetric(metric.value);
								}}
								className="block min-h-10 rounded-lg border border-input bg-background px-3"
							>
								{DETAIL_METRICS.map(metric => (
									<option
										key={metric.value}
										value={metric.value}
									>
										{metric.label}
									</option>
								))}
							</select>
						</label>
						<label className="flex items-center gap-2 text-sm font-semibold">
							<span className="shrink-0">Ordenar por:</span>
							<select
								value={monitoringSort}
								onChange={event => {
									const sort = SORTS.find(
										item =>
											item.value === event.target.value
									);
									if (sort) setMonitoringSort(sort.value);
								}}
								className="block min-h-10 rounded-lg border border-input bg-background px-3"
							>
								{SORTS.map(sort => (
									<option key={sort.value} value={sort.value}>
										{sort.label}
									</option>
								))}
							</select>
						</label>
						{options?.capabilities.canExport ? (
							<AnalyticsExportButton
								onClick={exportRows}
								isExporting={isExporting}
							/>
						) : null}
					</div>
				</div>
				<DataTable
					columns={COLUMNS}
					data={details.data?.rows ?? []}
					getRowKey={row => row.checkId}
					loading={details.isPending}
					emptyMessage="No hay chequeos para los filtros seleccionados"
				/>
				<PaginationControls
					page={page}
					totalPages={totalPages}
					onPageChange={setPage}
				/>
			</div>
		</div>
	);
};
