import { ClipboardList, Percent, UserCheck, UserX } from 'lucide-react';
import { EReportGroupBy, TMonitorReport } from '@api/monitor';
import { SkeletonCard } from '@shared/components';
import {
	formatGroupLabel,
	getGroupByChartTitle,
	isDateGroupKey,
} from './monitor-reports.utils';

interface SummaryCardProps {
	label: string;
	value: string;
	icon: React.ReactNode;
	accentClassName: string;
}

const SummaryCard = ({ label, value, icon, accentClassName }: SummaryCardProps) => (
	<div className="flex items-center gap-2 rounded-xl border border-card-border bg-card p-3 shadow-sm sm:gap-3 sm:p-4">
		<div className={`flex size-9 shrink-0 items-center justify-center rounded-lg sm:size-10 ${accentClassName}`}>
			{icon}
		</div>
		<div className="min-w-0">
			<p className="truncate text-xs text-muted-foreground">{label}</p>
			<p className="truncate text-lg font-semibold text-foreground sm:text-xl">{value}</p>
		</div>
	</div>
);

const ComplianceByGroupChart = ({
	report,
	groupBy,
}: {
	report: TMonitorReport;
	groupBy: EReportGroupBy;
}) => {
	const groups = report.groups ?? [];

	if (groups.length === 0) return null;

	const sortedGroups = [...groups].sort((a, b) =>
		isDateGroupKey(a.groupKey) && isDateGroupKey(b.groupKey)
			? a.groupKey.localeCompare(b.groupKey)
			: a.groupLabel.localeCompare(b.groupLabel)
	);

	return (
		<div className="rounded-xl border border-card-border bg-card p-3 shadow-sm sm:p-4">
			<p className="mb-3 text-sm font-semibold text-foreground sm:mb-4">
				{getGroupByChartTitle(groupBy)}
			</p>
			<div className="flex h-32 items-end gap-1.5 overflow-x-auto sm:h-40 sm:gap-2">
				{sortedGroups.map(group => {
					const label = formatGroupLabel(group);
					const complianceRate = group.complianceRate ?? 0;
					return (
						<div
							key={group.groupKey}
							className="flex h-full min-w-9 flex-1 flex-col items-center justify-end gap-1 sm:min-w-10 sm:gap-1.5"
							title={`${label}: ${group.complianceRate === null ? 'No calculable' : `${group.complianceRate.toFixed(1)}%`} (${group.present}/${group.totalChecks})`}
						>
							<span className="text-[11px] font-medium text-muted-foreground">
								{group.complianceRate === null
									? 'N/D'
									: `${group.complianceRate.toFixed(0)}%`}
							</span>
							<div
								className="w-full rounded-t-md bg-primary/80 transition-all"
								style={{
									height: `${Math.max(complianceRate, 2)}%`,
								}}
							/>
							<span className="w-full truncate text-center text-[10px] text-muted-foreground">
								{label}
							</span>
						</div>
					);
				})}
			</div>
		</div>
	);
};

interface MonitorReportSummaryProps {
	report?: TMonitorReport;
	isLoading: boolean;
	groupBy: EReportGroupBy;
}

export const MonitorReportSummary = ({
	report,
	isLoading,
	groupBy,
}: MonitorReportSummaryProps) => {
	if (isLoading) {
		return (
			<div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
				<SkeletonCard fields={1} showNumber={false} />
				<SkeletonCard fields={1} showNumber={false} />
				<SkeletonCard fields={1} showNumber={false} />
				<SkeletonCard fields={1} showNumber={false} />
			</div>
		);
	}

	if (!report) return null;

	return (
		<div className="space-y-4">
			<div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
				<SummaryCard
					label="Total chequeos"
					value={String(report.totalChecks)}
					icon={<ClipboardList className="size-5 text-primary" />}
					accentClassName="bg-primary/10"
				/>
				<SummaryCard
					label="Presentes"
					value={String(report.present)}
					icon={<UserCheck className="size-5 text-green-600" />}
					accentClassName="bg-green-100"
				/>
				<SummaryCard
					label="Ausentes"
					value={String(report.absent)}
					icon={<UserX className="size-5 text-red-600" />}
					accentClassName="bg-red-100"
				/>
				<SummaryCard
					label="% Cumplimiento"
					value={
						report.complianceRate === null
							? 'No calculable'
							: `${report.complianceRate.toFixed(1)}%`
					}
					icon={<Percent className="size-5 text-accent" />}
					accentClassName="bg-accent/10"
				/>
			</div>

			<ComplianceByGroupChart report={report} groupBy={groupBy} />
		</div>
	);
};
