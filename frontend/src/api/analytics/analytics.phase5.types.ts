import type {
	AnalyticsMetricNote,
	AnalyticsMetricResult,
} from './analytics.types';
import type { DigitalBlackboardUseStatus } from '../monitor/monitor.types';

export interface MonitoringFilters {
	dateFrom?: string;
	dateTo?: string;
	periodId?: string;
	centerId?: string;
	centerDepartmentId?: string;
	teacherId?: string;
	buildingId?: string;
}

export type MonitoringDetailMetric =
	| 'monitoring_checks'
	| 'digital_blackboard_use';
export type MonitoringDetailSort =
	| 'checkDate:asc'
	| 'checkDate:desc'
	| 'teacherName:asc'
	| 'teacherName:desc'
	| 'buildingName:asc'
	| 'buildingName:desc';

export interface MonitoringDetailsFilters extends MonitoringFilters {
	metric: MonitoringDetailMetric;
	page?: string;
	size?: string;
	sort?: MonitoringDetailSort;
}

export type MonitoringExportFilters = Omit<
	MonitoringDetailsFilters,
	'page' | 'size'
>;

export interface MonitoringDistributionItem {
	id: string;
	label: string;
	totalChecks: number;
	present: number;
	absent: number;
	complianceRate: number;
}

export interface MonitoringSummary {
	notes: AnalyticsMetricNote[];
	metrics: {
		totalChecks: AnalyticsMetricResult;
		presentChecks: AnalyticsMetricResult;
		absentChecks: AnalyticsMetricResult;
		complianceRate: AnalyticsMetricResult;
		observedBlackboardUseRate: AnalyticsMetricResult;
		blackboardObservationCoverage: AnalyticsMetricResult;
	};
	distributions: {
		byDay: MonitoringDistributionItem[];
		byTeacher: MonitoringDistributionItem[];
		byBuilding: MonitoringDistributionItem[];
		byCenter: MonitoringDistributionItem[];
		byCenterDepartment: MonitoringDistributionItem[];
		byPeriod: MonitoringDistributionItem[];
		blackboardUseStatus: {
			id: DigitalBlackboardUseStatus;
			label: string;
			value: number;
		}[];
	};
}

export interface MonitoringDetailRow {
	checkId: string;
	checkDate: string;
	checkTime: string;
	isPresent: boolean;
	observation: string | null;
	digitalBlackboardUseStatus: DigitalBlackboardUseStatus | null;
	monitorId: string;
	monitorName: string;
	sectionId: string;
	courseCode: string;
	courseName: string;
	groupCode: string;
	teacherId: string;
	teacherName: string;
	classroomId: string;
	classroomName: string;
	buildingId: string;
	buildingName: string;
	centerId: string;
	centerName: string;
	centerDepartmentId: string;
	centerDepartmentName: string;
	periodId: string;
	periodLabel: string;
}

export interface MonitoringDetails {
	metric: MonitoringDetailMetric;
	rows: MonitoringDetailRow[];
	meta: { page: number; size: number; total: number };
	notes: AnalyticsMetricNote[];
}
