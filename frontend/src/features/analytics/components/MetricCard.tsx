import { Info } from 'lucide-react';
import { Popover } from 'radix-ui';
import type {
	AnalyticsCoverage,
	AnalyticsCoverageReason,
	AnalyticsDataStatus,
	AnalyticsMetricResult,
	AnalyticsMetricNote,
	AnalyticsMetricUnit,
} from '@api/analytics';

interface MetricCardProps {
	label: string;
	metric: AnalyticsMetricResult;
	description?: string;
	showNotes?: boolean;
}

const numberFormatter = new Intl.NumberFormat('es-HN', {
	maximumFractionDigits: 2,
});

const STATUS_DETAILS = {
	complete: null,
	partial: {
		title: 'Resultado con datos incompletos',
		className: 'border-amber-300 bg-amber-50 text-amber-700',
	},
	unavailable: {
		title: 'No se puede calcular',
		className: 'border-destructive/30 bg-destructive/10 text-destructive',
	},
	not_applicable: {
		title: 'No aplica a esta selección',
		className: 'border-border bg-muted text-muted-foreground',
	},
} satisfies Record<
	AnalyticsDataStatus,
	{ title: string; className: string } | null
>;

const COVERAGE_REASON_LABELS = {
	missing_enrollment: 'Falta matrícula',
	missing_classroom_capacity: 'Falta capacidad del aula',
	invalid_classroom_capacity: 'Capacidad del aula inválida',
	invalid_schedule_days: 'Días de clase inválidos',
	invalid_schedule_section: 'Rango de clase inválido',
	missing_assignment_report: 'Falta reporte de asignación',
	unknown_digital_blackboard_use: 'Uso de pizarra desconocido',
	missing_digital_blackboard_use: 'Falta captura de uso de pizarra',
} satisfies Record<AnalyticsCoverageReason, string>;

const NOTE_LABELS = {
	current_classroom_capacity: 'Capacidad actual aplicada',
	current_classroom_catalog: 'Catálogo actual de aulas aplicado',
	current_inventory_catalog: 'Catálogo actual de inventario aplicado',
	potential_technology_coverage: 'Cobertura tecnológica potencial',
	section_enrollments_not_unique_students:
		'Matrículas por sección, no estudiantes únicos',
	current_staff_attributes: 'Atributos actuales del personal',
	current_position_catalog: 'Catálogo actual de cargos',
	current_activity_type_catalog: 'Catálogo actual de tipos de actividad',
	assignment_reports_without_workflow: 'Sin estado de revisión o aprobación',
	observed_digital_blackboard_use: 'Uso observado durante chequeos',
} satisfies Record<AnalyticsMetricNote, string>;

const formattedNumber = (
	value: number | null,
	unit: AnalyticsMetricUnit,
	nullLabel = 'No calculable'
) =>
	value === null
		? nullLabel
		: `${numberFormatter.format(value)}${unit === 'percentage' ? '%' : ''}`;

const signedNumber = (value: number | null, unit: AnalyticsMetricUnit) =>
	value === null
		? 'No calculable'
		: `${value > 0 ? '+' : ''}${numberFormatter.format(value)}${unit === 'percentage' ? '%' : ''}`;

const nullMetricLabel = (
	status: AnalyticsDataStatus,
	unit: AnalyticsMetricUnit
) =>
	status === 'not_applicable'
		? '—'
		: unit === 'percentage'
			? 'No calculable'
			: 'Sin información';

const NOT_APPLICABLE_DETAILS: Record<string, string> = {
	capacityDataCoverage:
		'No hay aulas aplicables en la selección actual, por lo que no existe una base para medir la cobertura de capacidad.',
	digitalBlackboardCoverage:
		'No hay aulas elegibles en la selección actual, por lo que no existe una base para calcular la cobertura tecnológica.',
	equippedEnrollmentDataCoverage:
		'No hay secciones aplicables en la selección actual, por lo que no existe una base para medir la cobertura de matrícula.',
	complianceRate:
		'No hay verificaciones en la selección actual, por lo que no existe una base para calcular el cumplimiento.',
	observedBlackboardUseRate:
		'No hay observaciones determinadas sobre uso de pizarra, por lo que no existe una base para calcular el porcentaje.',
	blackboardObservationCoverage:
		'No hay verificaciones elegibles para observar el uso de pizarra en la selección actual.',
};

const UNAVAILABLE_DETAILS: Record<string, string> = {
	averageSectionsPerTeacher:
		'No hay docentes asignados en la selección actual, por lo que no se puede calcular el promedio de secciones.',
	averageUvsPerTeacher:
		'No hay docentes asignados en la selección actual, por lo que no se puede calcular el promedio de UV.',
	averageActivitiesPerReportedTeacher:
		'No hay docentes con actividades reportadas en la selección actual, por lo que no se puede calcular el promedio.',
};

const coverageDetail = (coverage?: AnalyticsCoverage) => {
	if (!coverage || coverage.total === 0) return null;
	if (coverage.included === 0) {
		return `Hay ${coverage.total} registros aplicables, pero ninguno contiene la información necesaria.`;
	}
	const excludedDetail =
		coverage.excluded === 1
			? 'El registro restante no se incluyó.'
			: `Los ${coverage.excluded} registros restantes no se incluyeron.`;
	return `El resultado se calculó con ${coverage.included} de ${coverage.total} registros. ${excludedDetail}`;
};

const statusDescription = (
	status: AnalyticsDataStatus,
	metricKey: string,
	coverage?: AnalyticsCoverage
) => {
	if (status === 'not_applicable') {
		return (
			NOT_APPLICABLE_DETAILS[metricKey] ??
			'No hay registros aplicables en la selección actual, por lo que este indicador no tiene una base de cálculo.'
		);
	}
	if (status === 'unavailable') {
		return (
			UNAVAILABLE_DETAILS[metricKey] ??
			coverageDetail(coverage) ??
			'Existen registros aplicables, pero falta la información necesaria para calcular este indicador.'
		);
	}
	return (
		coverageDetail(coverage) ??
		'El indicador se calculó parcialmente porque algunos registros no tienen la información necesaria.'
	);
};

const StatusInfo = ({
	status,
	metricKey,
	metricLabel,
	coverage,
}: {
	status: AnalyticsDataStatus;
	metricKey: string;
	metricLabel: string;
	coverage?: AnalyticsCoverage;
}) => {
	const detail = STATUS_DETAILS[status];
	if (!detail) return null;
	const reasons = coverage?.reasons ?? [];

	return (
		<Popover.Root>
			<Popover.Trigger asChild>
				<button
					type="button"
					aria-label={`Información sobre ${metricLabel}`}
					className={`flex size-4 shrink-0 cursor-pointer items-center justify-center rounded-full border transition-colors hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 ${detail.className}`}
				>
					<Info className="size-3" />
				</button>
			</Popover.Trigger>
			<Popover.Portal>
				<Popover.Content
					sideOffset={6}
					align="end"
					collisionPadding={12}
					className="z-50 w-72 rounded-lg border border-border bg-card p-3 text-card-foreground shadow-lg outline-none"
				>
					<p className="text-sm font-semibold">{detail.title}</p>
					<p className="mt-1 text-xs leading-relaxed text-muted-foreground">
						{statusDescription(status, metricKey, coverage)}
					</p>
					{reasons.length ? (
						<p className="mt-2 text-xs font-medium text-foreground">
							Motivo:{' '}
							{reasons
								.map(reason => COVERAGE_REASON_LABELS[reason])
								.join(', ')}
							.
						</p>
					) : null}
					<Popover.Arrow className="fill-card" />
				</Popover.Content>
			</Popover.Portal>
		</Popover.Root>
	);
};

export const MetricCard = ({
	label,
	metric,
	description,
	showNotes = true,
}: MetricCardProps) => {
	const currentStatus =
		metric.comparison?.currentDataStatus ?? metric.dataStatus;
	const currentCoverage =
		metric.comparison?.currentCoverage ?? metric.coverage;
	const nullLabel = nullMetricLabel(currentStatus, metric.unit);

	return (
		<article className="rounded-xl border border-card-border bg-card p-4 shadow-sm">
			<div className="flex items-center justify-between gap-3">
				<p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
					{label}
				</p>
				<StatusInfo
					status={currentStatus}
					metricKey={metric.key}
					metricLabel={label}
					coverage={currentCoverage}
				/>
			</div>
			<p
				className={`mt-3 font-semibold tabular-nums text-card-foreground ${metric.value === null ? 'text-base' : 'text-3xl'}`}
			>
				{formattedNumber(metric.value, metric.unit, nullLabel)}
			</p>
			{metric.numerator !== undefined &&
			metric.denominator !== undefined ? (
				<p className="mt-2 text-xs text-muted-foreground">
					Relación:{' '}
					<span className="font-semibold tabular-nums text-foreground">
						{numberFormatter.format(metric.numerator)}/
						{numberFormatter.format(metric.denominator)}
					</span>
				</p>
			) : null}
			{description ? (
				<p className="mt-3 text-xs leading-relaxed text-muted-foreground">
					{description}
				</p>
			) : null}
			{showNotes &&
				metric.notes?.map(note => (
					<p
						key={note}
						className="mt-2 text-xs font-medium text-muted-foreground"
					>
						{NOTE_LABELS[note]}
					</p>
				))}
			{metric.comparison ? (
				<div className="mt-3 border-t border-border pt-3 text-xs text-muted-foreground">
					<div className="flex items-center justify-between gap-2">
						<p>
							Período comparado:{' '}
							<span className="font-semibold text-foreground">
								{formattedNumber(
									metric.comparison.comparison,
									metric.unit,
									nullMetricLabel(
										metric.comparison.comparisonDataStatus,
										metric.unit
									)
								)}
							</span>
						</p>
						<StatusInfo
							status={metric.comparison.comparisonDataStatus}
							metricKey={metric.key}
							metricLabel={`${label} del período comparado`}
							coverage={metric.comparison.comparisonCoverage}
						/>
					</div>
					<p className="mt-1">
						Diferencia:{' '}
						<span className="font-semibold text-foreground">
							{signedNumber(
								metric.comparison.absoluteChange,
								metric.unit
							)}
						</span>{' '}
						·{' '}
						{metric.comparison.percentageChange === null
							? 'porcentaje no calculable'
							: `${signedNumber(metric.comparison.percentageChange, 'percentage')}`}
					</p>
				</div>
			) : null}
		</article>
	);
};
