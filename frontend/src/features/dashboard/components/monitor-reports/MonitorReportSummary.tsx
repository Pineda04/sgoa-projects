import { ClipboardList, Percent, UserCheck, UserX } from 'lucide-react';
import { TMonitorReport } from '@api/monitor';
import { SkeletonCard } from '@shared/components';
import { formatCheckDate } from './monitor-reports.utils';

interface SummaryCardProps {
	label: string;
	value: string;
	icon: React.ReactNode;
	accentClassName: string;
}

const SummaryCard = ({ label, value, icon, accentClassName }: SummaryCardProps) => (
	<div className="flex items-center gap-3 rounded-xl border border-card-border bg-card p-4 shadow-sm">
		<div className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${accentClassName}`}>
			{icon}
		</div>
		<div className="min-w-0">
			<p className="text-xs text-muted-foreground">{label}</p>
			<p className="truncate text-xl font-semibold text-foreground">{value}</p>
		</div>
	</div>
);

const ComplianceByDayChart = ({ report }: { report: TMonitorReport }) => {
	const groups = report.groups ?? [];

	if (groups.length === 0) return null;

	const sortedGroups = [...groups].sort((a, b) =>
		a.groupKey.localeCompare(b.groupKey)
	);

	return (
		<div className="rounded-xl border border-card-border bg-card p-4 shadow-sm">
			<p className="mb-4 text-sm font-semibold text-foreground">
				Cumplimiento por día
			</p>
			<div className="flex h-40 items-end gap-2 overflow-x-auto">
				{sortedGroups.map(group => (
					<div
						key={group.groupKey}
						className="flex h-full min-w-10 flex-1 flex-col items-center justify-end gap-1.5"
						title={`${formatCheckDate(group.groupKey)}: ${group.complianceRate.toFixed(1)}% (${group.present}/${group.totalChecks})`}
					>
						<span className="text-[11px] font-medium text-muted-foreground">
							{group.complianceRate.toFixed(0)}%
						</span>
						<div
							className="w-full rounded-t-md bg-primary/80 transition-all"
							style={{
								height: `${Math.max(group.complianceRate, 2)}%`,
							}}
						/>
						<span className="text-[10px] text-muted-foreground">
							{formatCheckDate(group.groupKey)}
						</span>
					</div>
				))}
			</div>
		</div>
	);
};

interface MonitorReportSummaryProps {
	report?: TMonitorReport;
	isLoading: boolean;
}

export const MonitorReportSummary = ({
	report,
	isLoading,
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
					value={`${report.complianceRate.toFixed(1)}%`}
					icon={<Percent className="size-5 text-accent" />}
					accentClassName="bg-accent/10"
				/>
			</div>

			<ComplianceByDayChart report={report} />
		</div>
	);
};
