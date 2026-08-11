import { useState } from 'react';
import { AlertTriangle, CheckCircle2, CircleHelp } from 'lucide-react';
import type { IResponsiveColumn } from '@shared/components';
import { Button, PaginationControls, DataTable } from '@shared/components';
import { downloadBlob, ESwalIcons, genericAlert } from '@shared/utils';
import {
	analyticsApi,
	isEnrollmentDetailSort,
	useEnrollment,
	useEnrollmentDetails,
	type EnrollmentDetailRow,
	type EnrollmentDetailSort,
	type EnrollmentMetricKey,
} from '@api/analytics';
import { useAnalyticsFilters } from '../hooks';
import { AnalyticsSummarySkeleton } from './AnalyticsSkeletons';
import { AnalyticsExportButton } from './AnalyticsExportButton';
import { MetricCard } from './MetricCard';

const METRICS = [
	{ key: 'reportedEnrollments', label: 'Matrículas reportadas' },
	{ key: 'averageEnrollmentPerSection', label: 'Promedio por sección' },
	{ key: 'sectionsOverCapacity', label: 'Secciones sobre capacidad' },
	{ key: 'availablePhysicalSeats', label: 'Cupos físicos disponibles' },
	{ key: 'occupancyRate', label: 'Ocupación' },
	{ key: 'enrollmentDataCoverage', label: 'Cobertura de matrícula' },
] satisfies { key: EnrollmentMetricKey; label: string }[];

const SORT_OPTIONS = [
	{ value: 'courseCode:asc', label: 'Código ascendente' },
	{ value: 'courseCode:desc', label: 'Código descendente' },
	{ value: 'teacherName:asc', label: 'Docente A-Z' },
	{ value: 'teacherName:desc', label: 'Docente Z-A' },
	{ value: 'classroomName:asc', label: 'Aula A-Z' },
	{ value: 'classroomName:desc', label: 'Aula Z-A' },
	{ value: 'studentCount:desc', label: 'Mayor matrícula' },
	{ value: 'studentCount:asc', label: 'Menor matrícula' },
	{ value: 'occupancyRate:desc', label: 'Mayor ocupación' },
	{ value: 'occupancyRate:asc', label: 'Menor ocupación' },
] satisfies { value: EnrollmentDetailSort; label: string }[];

const numberFormatter = new Intl.NumberFormat('es-HN', {
	maximumFractionDigits: 2,
});

const formatNullableNumber = (value: number | null) =>
	value === null ? 'Sin información' : numberFormatter.format(value);

const formatOccupancy = (value: number | null) =>
	value === null ? 'No calculable' : `${numberFormatter.format(value)}%`;

const EnrollmentCapacityStatus = ({ status }: { status: boolean | null }) => {
	if (status === null) {
		return (
			<span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-border bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground">
				<CircleHelp className="size-3.5" aria-hidden="true" />
				No calculable
			</span>
		);
	}

	return status ? (
		<span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-destructive/30 bg-destructive/10 px-2.5 py-1 text-xs font-semibold text-destructive">
			<AlertTriangle className="size-3.5" aria-hidden="true" />
			Sobre capacidad
		</span>
	) : (
		<span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-primary/30 bg-primary-light px-2.5 py-1 text-xs font-semibold text-primary">
			<CheckCircle2 className="size-3.5" aria-hidden="true" />
			Dentro de capacidad
		</span>
	);
};

const COLUMNS = [
	{
		key: 'course',
		header: 'Asignatura / código',
		render: (row: EnrollmentDetailRow) => (
			<div className="min-w-48 text-left">
				<p className="font-semibold text-foreground">
					{row.courseName}
				</p>
				<p className="text-xs text-muted-foreground">
					{row.courseCode} · Sección {row.groupCode}
				</p>
			</div>
		),
	},
	{ key: 'teacherName', header: 'Docente' },
	{ key: 'classroomName', header: 'Aula' },
	{
		key: 'studentCount',
		header: 'Matrícula',
		render: (row: EnrollmentDetailRow) =>
			formatNullableNumber(row.studentCount),
	},
	{
		key: 'maxCapacity',
		header: 'Capacidad',
		render: (row: EnrollmentDetailRow) =>
			formatNullableNumber(row.maxCapacity),
	},
	{
		key: 'occupancyRate',
		header: 'Ocupación',
		render: (row: EnrollmentDetailRow) =>
			formatOccupancy(row.occupancyRate),
	},
	{
		key: 'availableSeats',
		header: 'Cupos',
		render: (row: EnrollmentDetailRow) =>
			formatNullableNumber(row.availableSeats),
	},
	{
		key: 'overCapacity',
		header: 'Estado',
		render: (row: EnrollmentDetailRow) => (
			<EnrollmentCapacityStatus status={row.overCapacity} />
		),
	},
] satisfies IResponsiveColumn<EnrollmentDetailRow>[];

export const EnrollmentSection = () => {
	const {
		enrollmentFilters,
		options,
		enrollmentUsesDomainScope,
		enrollmentPage,
		size,
		enrollmentSort,
		setEnrollmentPage,
		setEnrollmentSort,
	} = useAnalyticsFilters('enrollment');
	const [isExporting, setIsExporting] = useState(false);
	const summary = useEnrollment(enrollmentFilters);
	const details = useEnrollmentDetails(
		enrollmentFilters
			? {
					periodId: enrollmentFilters.periodId,
					...(enrollmentFilters.centerDepartmentId
						? {
								centerDepartmentId:
									enrollmentFilters.centerDepartmentId,
							}
						: {}),
					...(enrollmentFilters.teacherId
						? { teacherId: enrollmentFilters.teacherId }
						: {}),
					metric: 'enrollment_capacity',
					page: String(enrollmentPage),
					size: String(size),
					sort: enrollmentSort,
				}
			: undefined
	);

	if (!enrollmentFilters) {
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
		details.data && enrollmentPage > Math.max(totalPages, 1)
	);
	const handleSortChange = (value: string) => {
		if (isEnrollmentDetailSort(value)) setEnrollmentSort(value);
	};
	const handleExport = async () => {
		setIsExporting(true);
		try {
			const response = await analyticsApi.exportEnrollmentDetails({
				metric: 'enrollment_capacity',
				periodId: enrollmentFilters.periodId,
				...(enrollmentFilters.centerDepartmentId
					? {
							centerDepartmentId:
								enrollmentFilters.centerDepartmentId,
						}
					: {}),
				...(enrollmentFilters.teacherId
					? { teacherId: enrollmentFilters.teacherId }
					: {}),
				sort: enrollmentSort,
			});
			downloadBlob(
				response.data,
				`analytics-matricula-${enrollmentFilters.periodId}.xlsx`
			);
		} catch {
			await genericAlert(
				'No fue posible exportar el detalle de matrícula. Intenta nuevamente.',
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
					Matrícula y capacidad
				</h2>
				<p className="mt-1 text-sm text-muted-foreground">
					Indicadores de matrícula reportada y capacidad física del
					período. Los indicadores provienen del resumen del servidor.
				</p>
			</div>
			{enrollmentUsesDomainScope ? (
				<p className="mb-4 rounded-lg border border-border bg-muted px-3 py-2 text-xs text-muted-foreground">
					Este bloque usa el alcance autorizado específico de
					matrícula.
				</p>
			) : null}

			{summary.isError ? (
				<div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
					No fue posible cargar los indicadores de matrícula y
					capacidad.
				</div>
			) : summary.isPending ? (
				<AnalyticsSummarySkeleton count={METRICS.length} />
			) : (
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{METRICS.map(metric => (
						<MetricCard
							key={metric.key}
							label={metric.label}
							metric={summary.data.metrics[metric.key]}
						/>
					))}
				</div>
			)}

			<div className="mt-8 border-t border-border pt-6">
				<div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
					<div>
						<h3 className="text-lg font-semibold text-card-foreground">
							Detalle por sección
						</h3>
						<p className="text-xs text-muted-foreground">
							{details.data
								? `${details.data.meta.total} sección${details.data.meta.total === 1 ? '' : 'es'}`
								: 'Detalle paginado'}
						</p>
						<p className="mt-1 text-xs text-muted-foreground">
							La capacidad mostrada corresponde al estado actual
							de las aulas.
						</p>
						{details.data?.notes.includes(
							'current_classroom_capacity'
						) ? (
							<p className="mt-1 text-xs font-medium text-muted-foreground">
								Capacidad actual aplicada
							</p>
						) : null}
					</div>
					<div className="flex flex-col gap-2 sm:flex-row sm:items-center">
						<label className="flex items-center gap-2 text-sm font-semibold text-foreground">
							<span className="shrink-0">Ordenar por:</span>
							<select
								value={enrollmentSort}
								onChange={event =>
									handleSortChange(event.target.value)
								}
								className="min-h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm font-normal text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
							>
								{SORT_OPTIONS.map(option => (
									<option
										key={option.value}
										value={option.value}
									>
										{option.label}
									</option>
								))}
							</select>
						</label>
						{options?.capabilities.canExport ? (
							<AnalyticsExportButton
								onClick={handleExport}
								isExporting={isExporting}
							/>
						) : null}
					</div>
				</div>

				{details.isError ? (
					<div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
						No fue posible cargar el detalle de matrícula y
						capacidad.
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
							onClick={() => setEnrollmentPage(1)}
						>
							Volver a la página 1
						</Button>
					</div>
				) : (
					<>
						<DataTable<EnrollmentDetailRow>
							columns={COLUMNS}
							data={details.data?.rows ?? []}
							getRowKey={row => row.sectionId}
							loading={details.isPending}
							emptyMessage="No hay matrícula reportada para los filtros seleccionados"
						/>
						<PaginationControls
							page={enrollmentPage}
							totalPages={totalPages}
							onPageChange={setEnrollmentPage}
						/>
					</>
				)}
			</div>
		</div>
	);
};
