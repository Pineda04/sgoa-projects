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
}

const numberFormatter = new Intl.NumberFormat('es-HN', {
	maximumFractionDigits: 2,
});

const STATUS_BADGES = {
	complete: {
		label: 'Completa',
		className: 'border-primary/30 bg-primary-light text-primary',
	},
	partial: {
		label: 'Parcial',
		className: 'border-accent/40 bg-accent/10 text-foreground',
	},
	unavailable: {
		label: 'No disponible',
		className: 'border-destructive/30 bg-destructive/10 text-destructive',
	},
	not_applicable: {
		label: 'No aplica',
		className: 'border-border bg-muted text-muted-foreground',
	},
} satisfies Record<
	AnalyticsDataStatus,
	{ label: string; className: string }
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
	section_enrollments_not_unique_students: 'Matrículas por sección, no estudiantes únicos',
	current_staff_attributes: 'Atributos actuales del personal',
	current_position_catalog: 'Catálogo actual de cargos',
	current_activity_type_catalog: 'Catálogo actual de tipos de actividad',
	assignment_reports_without_workflow: 'Reportes sin estado de workflow',
	observed_digital_blackboard_use: 'Uso observado durante chequeos',
	legacy_checks_without_blackboard_use_capture:
		'Chequeos legados pueden no incluir captura de pizarra',
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

const StatusBadge = ({ status }: { status: AnalyticsDataStatus }) => {
	const badge = STATUS_BADGES[status];
	return (
		<span
			className={`shrink-0 rounded-full border px-2 py-0.5 text-[0.625rem] font-semibold ${badge.className}`}
		>
			{badge.label}
		</span>
	);
};

const Coverage = ({
	coverage,
	label = 'Cobertura',
}: {
	coverage: AnalyticsCoverage;
	label?: string;
}) => (
	<div className="mt-2 text-xs text-muted-foreground">
		<p>
			{label}:{' '}
			<span className="font-semibold tabular-nums text-foreground">
				{coverage.included}/{coverage.total}
			</span>
		</p>
		{coverage.reasons.length ? (
			<p className="mt-1">
				{coverage.reasons.map(reason => COVERAGE_REASON_LABELS[reason]).join(', ')}
			</p>
		) : null}
	</div>
);

export const MetricCard = ({ label, metric }: MetricCardProps) => {
	const currentStatus =
		metric.comparison?.currentDataStatus ?? metric.dataStatus;
	const currentCoverage =
		metric.comparison?.currentCoverage ?? metric.coverage;
	const nullLabel =
		metric.unit === 'percentage' ? 'No calculable' : 'Sin información';

	return (
		<article className="relative overflow-hidden rounded-xl border border-card-border bg-card p-4 shadow-sm">
			<div className="absolute inset-x-0 top-0 h-1 bg-primary" />
			<div className="flex items-start justify-between gap-3">
				<p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
					{label}
				</p>
				<StatusBadge status={currentStatus} />
			</div>
			<p className="mt-3 text-3xl font-semibold tabular-nums text-card-foreground">
				{formattedNumber(metric.value, metric.unit, nullLabel)}
			</p>
			{metric.numerator !== undefined && metric.denominator !== undefined ? (
				<p className="mt-2 text-xs text-muted-foreground">
					Relación:{' '}
					<span className="font-semibold tabular-nums text-foreground">
						{numberFormatter.format(metric.numerator)}/
						{numberFormatter.format(metric.denominator)}
					</span>
				</p>
			) : null}
			{currentCoverage ? (
				<Coverage
					coverage={currentCoverage}
					label={metric.comparison ? 'Cobertura actual' : 'Cobertura'}
				/>
			) : null}
			{metric.notes?.map(note => (
				<p key={note} className="mt-2 text-xs font-medium text-muted-foreground">
					{NOTE_LABELS[note]}
				</p>
			))}
			{metric.comparison ? (
				<div className="mt-3 border-t border-border pt-3 text-xs text-muted-foreground">
					<div className="flex items-center justify-between gap-2">
						<p>
							Período comparado:{' '}
							<span className="font-semibold text-foreground">
								{formattedNumber(metric.comparison.comparison, metric.unit)}
							</span>
						</p>
						<StatusBadge status={metric.comparison.comparisonDataStatus} />
					</div>
					{metric.comparison.comparisonCoverage ? (
						<Coverage
							coverage={metric.comparison.comparisonCoverage}
							label="Cobertura comparada"
						/>
					) : null}
					<p className="mt-1">
						Diferencia:{' '}
						<span className="font-semibold text-foreground">
							{signedNumber(metric.comparison.absoluteChange, metric.unit)}
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
