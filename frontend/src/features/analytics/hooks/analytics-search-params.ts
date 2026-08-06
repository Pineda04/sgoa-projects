import {
	createParser,
	parseAsInteger,
	parseAsString,
	parseAsStringLiteral,
	useQueryStates,
} from 'nuqs';
import {
	ACADEMIC_LOAD_DETAIL_SORTS,
	CLASSROOM_AVAILABILITY_SORTS,
	CLASSROOM_DAY_CODES,
	ENROLLMENT_DETAIL_SORTS,
	type ActivityDetailSort,
	type AnalyticsDomain,
	type ClassroomCapacitySort,
	type MonitoringDetailSort,
	type StaffDetailSort,
	type TechnologyDetailSort,
} from '@api/analytics';

const TIME_VALUE = /^(?:[01]\d|2[0-3]):[0-5]\d$/;
const DATE_VALUE = /^\d{4}-\d{2}-\d{2}$/;

const parseAsPositiveInteger = createParser({
	parse: value => {
		const parsed = parseAsInteger.parse(value);
		return parsed !== null && parsed > 0 ? parsed : null;
	},
	serialize: String,
});

const parseAsTime = createParser({
	parse: value => (TIME_VALUE.test(value) ? value : null),
	serialize: String,
});

const parseAsDate = createParser({
	parse: value => (DATE_VALUE.test(value) ? value : null),
	serialize: String,
});

export const ANALYTICS_DOMAINS = [
	'academic-load',
	'enrollment',
	'classrooms',
	'technology',
	'staff',
	'activities',
	'monitoring',
] as const satisfies readonly AnalyticsDomain[];

const CLASSROOM_CAPACITY_SORTS = [
	'classroomName:asc',
	'classroomName:desc',
	'buildingName:asc',
	'buildingName:desc',
	'maxCapacity:asc',
	'maxCapacity:desc',
	'capacityStatus:asc',
	'capacityStatus:desc',
] as const satisfies readonly ClassroomCapacitySort[];

const TECHNOLOGY_DETAIL_METRICS = [
	'equipped_classrooms',
	'equipped_classroom_enrollment',
	'equipment_inventory',
] as const;

const TECHNOLOGY_DETAIL_SORTS = [
	'classroomName:asc',
	'classroomName:desc',
	'buildingName:asc',
	'buildingName:desc',
	'digitalBlackboardCount:asc',
	'digitalBlackboardCount:desc',
	'equipped:asc',
	'equipped:desc',
	'courseCode:asc',
	'courseCode:desc',
	'teacherName:asc',
	'teacherName:desc',
	'studentCount:asc',
	'studentCount:desc',
	'equipmentType:asc',
	'equipmentType:desc',
	'conditionLabel:asc',
	'conditionLabel:desc',
] as const satisfies readonly TechnologyDetailSort[];

const STAFF_DETAIL_SORTS = [
	'name:asc',
	'name:desc',
	'code:asc',
	'code:desc',
	'contractName:asc',
	'contractName:desc',
	'categoryName:asc',
	'categoryName:desc',
	'shiftName:asc',
	'shiftName:desc',
] as const satisfies readonly StaffDetailSort[];

const ACTIVITY_DETAIL_SORTS = [
	'activityName:asc',
	'activityName:desc',
	'typeName:asc',
	'typeName:desc',
	'teacherName:asc',
	'teacherName:desc',
	'period:asc',
	'period:desc',
	'progressLevel:asc',
	'progressLevel:desc',
] as const satisfies readonly ActivityDetailSort[];

const MONITORING_DETAIL_SORTS = [
	'checkDate:asc',
	'checkDate:desc',
	'teacherName:asc',
	'teacherName:desc',
	'buildingName:asc',
	'buildingName:desc',
] as const satisfies readonly MonitoringDetailSort[];

export const analyticsSearchParams = {
	section: parseAsStringLiteral(ANALYTICS_DOMAINS),
	periodId: parseAsString,
	comparisonPeriodId: parseAsString,
	centerDepartmentId: parseAsString,
	teacherId: parseAsString,
	buildingId: parseAsString,
	dayOfWeek: parseAsStringLiteral(CLASSROOM_DAY_CODES).withDefault('Lu'),
	startTime: parseAsTime.withDefault('07:00'),
	endTime: parseAsTime.withDefault('08:00'),
	classroomView: parseAsStringLiteral([
		'availability',
		'capacity',
	]).withDefault('availability'),
	contractTypeId: parseAsString,
	categoryId: parseAsString,
	shiftId: parseAsString,
	positionId: parseAsString,
	activityTypeId: parseAsString,
	activityTimeMode: parseAsStringLiteral(['period', 'year']).withDefault(
		'period'
	),
	activityYear: parseAsInteger,
	activityPac: parseAsString,
	activityPacModality: parseAsString,
	loadPage: parseAsPositiveInteger.withDefault(1),
	enrollmentPage: parseAsPositiveInteger.withDefault(1),
	classroomPage: parseAsPositiveInteger.withDefault(1),
	capacityPage: parseAsPositiveInteger.withDefault(1),
	technologyPage: parseAsPositiveInteger.withDefault(1),
	staffPage: parseAsPositiveInteger.withDefault(1),
	activityPage: parseAsPositiveInteger.withDefault(1),
	monitoringPage: parseAsPositiveInteger.withDefault(1),
	loadSort: parseAsStringLiteral(ACADEMIC_LOAD_DETAIL_SORTS).withDefault(
		'name:asc'
	),
	enrollmentSort: parseAsStringLiteral(ENROLLMENT_DETAIL_SORTS).withDefault(
		'courseCode:asc'
	),
	classroomSort: parseAsStringLiteral(
		CLASSROOM_AVAILABILITY_SORTS
	).withDefault('classroomName:asc'),
	capacitySort: parseAsStringLiteral(CLASSROOM_CAPACITY_SORTS).withDefault(
		'classroomName:asc'
	),
	technologyMetric: parseAsStringLiteral(
		TECHNOLOGY_DETAIL_METRICS
	).withDefault('equipped_classrooms'),
	technologySort: parseAsStringLiteral(TECHNOLOGY_DETAIL_SORTS).withDefault(
		'classroomName:asc'
	),
	technologyBreakdown: parseAsStringLiteral([
		'type',
		'condition',
		'building',
	]).withDefault('type'),
	staffSort: parseAsStringLiteral(STAFF_DETAIL_SORTS).withDefault('name:asc'),
	staffBreakdown: parseAsStringLiteral([
		'contract',
		'category',
		'shift',
		'position',
	]).withDefault('contract'),
	activitySort: parseAsStringLiteral(ACTIVITY_DETAIL_SORTS).withDefault(
		'activityName:asc'
	),
	activityBreakdown: parseAsStringLiteral([
		'type',
		'period',
		'center',
		'teacher',
	]).withDefault('type'),
	dateFrom: parseAsDate,
	dateTo: parseAsDate,
	monitoringMetric: parseAsStringLiteral([
		'monitoring_checks',
		'digital_blackboard_use',
	]).withDefault('monitoring_checks'),
	monitoringSort: parseAsStringLiteral(MONITORING_DETAIL_SORTS).withDefault(
		'checkDate:desc'
	),
	monitoringBreakdown: parseAsStringLiteral([
		'day',
		'teacher',
		'building',
		'center',
		'centerDepartment',
		'period',
	]).withDefault('day'),
};

export const useAnalyticsSearchParams = () =>
	useQueryStates(analyticsSearchParams, { history: 'replace' });

export const resetAnalyticsSection = (section: AnalyticsDomain) => ({
	section,
	periodId: null,
	comparisonPeriodId: null,
	centerDepartmentId: null,
	teacherId: null,
	buildingId: null,
	dayOfWeek: null,
	startTime: null,
	endTime: null,
	classroomView: null,
	contractTypeId: null,
	categoryId: null,
	shiftId: null,
	positionId: null,
	activityTypeId: null,
	activityTimeMode: null,
	activityYear: null,
	activityPac: null,
	activityPacModality: null,
	loadPage: null,
	enrollmentPage: null,
	classroomPage: null,
	capacityPage: null,
	technologyPage: null,
	staffPage: null,
	activityPage: null,
	monitoringPage: null,
	loadSort: null,
	enrollmentSort: null,
	classroomSort: null,
	capacitySort: null,
	technologyMetric: null,
	technologySort: null,
	technologyBreakdown: null,
	staffSort: null,
	staffBreakdown: null,
	activitySort: null,
	activityBreakdown: null,
	dateFrom: null,
	dateTo: null,
	monitoringMetric: null,
	monitoringSort: null,
	monitoringBreakdown: null,
});
