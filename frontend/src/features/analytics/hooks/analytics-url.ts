import type {
	AcademicLoadDetailSort,
	ActivityDetailSort,
	ClassroomAvailabilitySort,
	ClassroomCapacitySort,
	ClassroomDayOfWeek,
	EnrollmentDetailSort,
	StaffDetailSort,
	TechnologyDetailMetric,
	TechnologyDetailSort,
	MonitoringDetailMetric,
	MonitoringDetailSort,
} from '@api/analytics';
import type {
	ActivityBreakdown,
	ActivityTimeMode,
	ClassroomView,
	ImplementedAnalyticsDomain,
	StaffBreakdown,
	TechnologyBreakdown,
	MonitoringBreakdown,
} from './useAnalyticsFilters';

interface CanonicalAnalyticsUrlState {
	domain: ImplementedAnalyticsDomain;
	periodId?: string;
	comparisonPeriodId?: string;
	centerDepartmentId?: string;
	teacherId?: string;
	dayOfWeek: ClassroomDayOfWeek;
	startTime: string;
	endTime: string;
	classroomView: ClassroomView;
	contractTypeId?: string;
	categoryId?: string;
	shiftId?: string;
	positionId?: string;
	activityTypeId?: string;
	activityTimeMode: ActivityTimeMode;
	activityYear?: number;
	activityPac?: string;
	activityPacModality?: string;
	page: number;
	loadSort: AcademicLoadDetailSort;
	enrollmentSort: EnrollmentDetailSort;
	classroomSort: ClassroomAvailabilitySort;
	capacitySort: ClassroomCapacitySort;
	technologyMetric: TechnologyDetailMetric;
	technologySort: TechnologyDetailSort;
	technologyBreakdown: TechnologyBreakdown;
	staffSort: StaffDetailSort;
	staffBreakdown: StaffBreakdown;
	activitySort: ActivityDetailSort;
	activityBreakdown: ActivityBreakdown;
	buildingId?: string;
	dateFrom: string;
	dateTo: string;
	monitoringMetric: MonitoringDetailMetric;
	monitoringSort: MonitoringDetailSort;
	monitoringBreakdown: MonitoringBreakdown;
}

const setValue = (
	params: URLSearchParams,
	key: string,
	value: string | undefined
) => {
	if (value !== undefined) params.set(key, value);
};

const setPage = (params: URLSearchParams, key: string, page: number) => {
	if (page > 1) params.set(key, String(page));
};

const setScope = (
	params: URLSearchParams,
	state: CanonicalAnalyticsUrlState,
	includeTeacher: boolean
) => {
	setValue(params, 'centerDepartmentId', state.centerDepartmentId);
	if (includeTeacher) setValue(params, 'teacherId', state.teacherId);
};

export const buildCanonicalAnalyticsSearchParams = (
	state: CanonicalAnalyticsUrlState
) => {
	const params = new URLSearchParams({ section: state.domain });

	if (state.domain === 'academic-load') {
		setValue(params, 'periodId', state.periodId);
		setValue(params, 'comparisonPeriodId', state.comparisonPeriodId);
		setScope(params, state, true);
		params.set('loadSort', state.loadSort);
		setPage(params, 'loadPage', state.page);
		return params;
	}

	if (state.domain === 'enrollment') {
		setValue(params, 'periodId', state.periodId);
		setValue(params, 'comparisonPeriodId', state.comparisonPeriodId);
		setScope(params, state, true);
		params.set('enrollmentSort', state.enrollmentSort);
		setPage(params, 'enrollmentPage', state.page);
		return params;
	}

	if (state.domain === 'classrooms') {
		setValue(params, 'periodId', state.periodId);
		setScope(params, state, false);
		params.set('classroomView', state.classroomView);
		if (state.classroomView === 'capacity') {
			params.set('capacitySort', state.capacitySort);
			setPage(params, 'capacityPage', state.page);
		} else {
			params.set('dayOfWeek', state.dayOfWeek);
			params.set('startTime', state.startTime);
			params.set('endTime', state.endTime);
			params.set('classroomSort', state.classroomSort);
			setPage(params, 'classroomPage', state.page);
		}
		return params;
	}

	if (state.domain === 'technology') {
		setValue(params, 'periodId', state.periodId);
		setScope(params, state, false);
		params.set('technologyMetric', state.technologyMetric);
		params.set('technologySort', state.technologySort);
		params.set('technologyBreakdown', state.technologyBreakdown);
		setPage(params, 'technologyPage', state.page);
		return params;
	}

	if (state.domain === 'staff') {
		setScope(params, state, true);
		setValue(params, 'contractTypeId', state.contractTypeId);
		setValue(params, 'categoryId', state.categoryId);
		setValue(params, 'shiftId', state.shiftId);
		setValue(params, 'positionId', state.positionId);
		params.set('staffSort', state.staffSort);
		params.set('staffBreakdown', state.staffBreakdown);
		setPage(params, 'staffPage', state.page);
		return params;
	}

	if (state.domain === 'monitoring') {
		setValue(params, 'periodId', state.periodId);
		setValue(params, 'buildingId', state.buildingId);
		setValue(params, 'teacherId', state.teacherId);
		setValue(params, 'dateFrom', state.dateFrom);
		setValue(params, 'dateTo', state.dateTo);
		params.set('monitoringMetric', state.monitoringMetric);
		params.set('monitoringSort', state.monitoringSort);
		params.set('monitoringBreakdown', state.monitoringBreakdown);
		setPage(params, 'monitoringPage', state.page);
		return params;
	}

	params.set('activityTimeMode', state.activityTimeMode);
	if (state.activityTimeMode === 'period') {
		setValue(params, 'periodId', state.periodId);
	} else {
		setValue(
			params,
			'activityYear',
			state.activityYear === undefined ? undefined : String(state.activityYear)
		);
		setValue(params, 'activityPac', state.activityPac);
		setValue(params, 'activityPacModality', state.activityPacModality);
	}
	setScope(params, state, true);
	setValue(params, 'activityTypeId', state.activityTypeId);
	params.set('activitySort', state.activitySort);
	params.set('activityBreakdown', state.activityBreakdown);
	setPage(params, 'activityPage', state.page);
	return params;
};
