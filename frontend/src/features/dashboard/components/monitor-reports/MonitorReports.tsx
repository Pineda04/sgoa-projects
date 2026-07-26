import { useMemo, useState } from 'react';
import {
	EReportGroupBy,
	useGetChecks,
	useGetComplianceReport,
	useGetMonitorBuildings,
} from '@api/monitor';
import { TagError } from '@shared/components';
import { MonitorReportFilters } from './MonitorReportFilters';
import { MonitorReportSummary } from './MonitorReportSummary';
import { MonitorReportTable } from './MonitorReportTable';
import { getDateDaysAgoString, getTodayDateString } from './monitor-reports.utils';

const DEFAULT_RANGE_DAYS = 6;

export const MonitorReports = () => {
	const [dateFrom, setDateFrom] = useState(() =>
		getDateDaysAgoString(DEFAULT_RANGE_DAYS)
	);
	const [dateTo, setDateTo] = useState(getTodayDateString);
	const [teacherId, setTeacherId] = useState('');
	const [buildingId, setBuildingId] = useState('');
	const [groupBy, setGroupBy] = useState(EReportGroupBy.DAY);
	const [teacherResetKey, setTeacherResetKey] = useState(0);

	const { data: buildings } = useGetMonitorBuildings();

	const filters = useMemo(
		() => ({
			dateFrom: dateFrom || undefined,
			dateTo: dateTo || undefined,
			teacherId: teacherId || undefined,
			buildingId: buildingId || undefined,
		}),
		[dateFrom, dateTo, teacherId, buildingId]
	);

	const reportFilters = useMemo(
		() => ({ ...filters, groupBy }),
		[filters, groupBy]
	);

	const reportQuery = useGetComplianceReport(reportFilters);
	const checksQuery = useGetChecks(filters);

	const handleReset = () => {
		setDateFrom(getDateDaysAgoString(DEFAULT_RANGE_DAYS));
		setDateTo(getTodayDateString());
		setTeacherId('');
		setBuildingId('');
		setGroupBy(EReportGroupBy.DAY);
		setTeacherResetKey(key => key + 1);
	};

	return (
		<div className="space-y-6">
			<MonitorReportFilters
				dateFrom={dateFrom}
				dateTo={dateTo}
				buildingId={buildingId}
				groupBy={groupBy}
				buildings={buildings ?? []}
				teacherResetKey={teacherResetKey}
				onDateFromChange={setDateFrom}
				onDateToChange={setDateTo}
				onBuildingChange={setBuildingId}
				onTeacherChange={setTeacherId}
				onGroupByChange={setGroupBy}
				onReset={handleReset}
			/>

			{reportQuery.isError ? (
				<TagError text="Ocurrió un error al cargar el resumen del reporte." />
			) : (
				<MonitorReportSummary
					report={reportQuery.data}
					isLoading={reportQuery.isLoading}
					groupBy={groupBy}
				/>
			)}

			<MonitorReportTable
				data={checksQuery.data?.data ?? []}
				isLoading={checksQuery.isLoading}
				isError={checksQuery.isError}
				totalPages={checksQuery.data?.meta?.lastPage ?? 0}
				filters={filters}
				summary={reportQuery.data}
			/>
		</div>
	);
};
