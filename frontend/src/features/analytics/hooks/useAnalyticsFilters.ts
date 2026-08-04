import { useSearchParams } from 'react-router-dom';
import {
	isAcademicLoadDetailSort,
	isClassroomAvailabilitySort,
	isClassroomCapacitySort,
	isClassroomDayOfWeek,
	isEnrollmentDetailSort,
	isTechnologyDetailMetric,
	useAnalyticsFilterOptions,
	type AcademicLoadDetailSort,
	type AcademicLoadFilters,
	type ActivityDetailSort,
	type ActivityFilters,
	type AnalyticsDomain,
	type AnalyticsFilterMode,
	type ClassroomAvailabilitySort,
	type ClassroomCapacitySort,
	type EnrollmentDetailSort,
	type EnrollmentFilters,
	type PeriodCenterFilters,
	type StaffDetailSort,
	type StaffFilters,
	type TechnologyDetailMetric,
	type TechnologyDetailSort,
	type MonitoringDetailMetric,
	type MonitoringDetailSort,
	type MonitoringFilters,
} from '@api/analytics';
import { buildCanonicalAnalyticsSearchParams } from './analytics-url';

export type ImplementedAnalyticsDomain = AnalyticsDomain;
export type ClassroomView = 'availability' | 'capacity';
export type TechnologyBreakdown = 'type' | 'condition' | 'building';
export type StaffBreakdown = 'contract' | 'category' | 'shift' | 'position';
export type ActivityBreakdown = 'type' | 'period' | 'center' | 'teacher';
export type ActivityTimeMode = 'period' | 'year';
export type MonitoringBreakdown =
	| 'day'
	| 'teacher'
	| 'building'
	| 'center'
	| 'centerDepartment'
	| 'period';

const DETAILS_PAGE_SIZE = 25;
const CANONICAL_TIME = /^(?:[01]\d|2[0-3]):[0-5]\d$/;
const CANONICAL_DATE = /^\d{4}-\d{2}-\d{2}$/;

const institutionalDate = (date: Date) =>
	new Intl.DateTimeFormat('en-CA', {
		timeZone: 'America/Tegucigalpa',
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
	}).format(date);

const includesId = (options: { id: string }[], id: string | null) =>
	Boolean(id && options.some(option => option.id === id));

const resolveDomainValue = (
	mode: AnalyticsFilterMode,
	options: { id: string }[],
	visibleValue: string | null,
	defaultValue: string | null
) => {
	if (mode === 'hidden') return undefined;
	if (mode === 'selectable' && includesId(options, visibleValue)) {
		return visibleValue ?? undefined;
	}
	if (includesId(options, defaultValue)) return defaultValue ?? undefined;
	return undefined;
};

const getPage = (value: string | null) => {
	const page = Number(value ?? '1');
	return Number.isInteger(page) && page > 0 ? page : 1;
};

const isStaffSort = (value: string | null): value is StaffDetailSort => {
	switch (value) {
		case 'name:asc':
		case 'name:desc':
		case 'code:asc':
		case 'code:desc':
		case 'contractName:asc':
		case 'contractName:desc':
		case 'categoryName:asc':
		case 'categoryName:desc':
		case 'shiftName:asc':
		case 'shiftName:desc':
			return true;
		default:
			return false;
	}
};

const isActivitySort = (value: string | null): value is ActivityDetailSort => {
	switch (value) {
		case 'activityName:asc':
		case 'activityName:desc':
		case 'typeName:asc':
		case 'typeName:desc':
		case 'teacherName:asc':
		case 'teacherName:desc':
		case 'period:asc':
		case 'period:desc':
		case 'progressLevel:asc':
		case 'progressLevel:desc':
			return true;
		default:
			return false;
	}
};

const technologyDefaultSort = (
	metric: TechnologyDetailMetric
): TechnologyDetailSort => {
	if (metric === 'equipped_classrooms') return 'classroomName:asc';
	if (metric === 'equipped_classroom_enrollment') return 'courseCode:asc';
	return 'equipmentType:asc';
};

const technologySort = (
	metric: TechnologyDetailMetric,
	value: string | null
): TechnologyDetailSort => {
	if (metric === 'equipped_classrooms') {
		switch (value) {
			case 'classroomName:asc':
			case 'classroomName:desc':
			case 'buildingName:asc':
			case 'buildingName:desc':
			case 'digitalBlackboardCount:asc':
			case 'digitalBlackboardCount:desc':
			case 'equipped:asc':
			case 'equipped:desc':
				return value;
		}
	}
	if (metric === 'equipped_classroom_enrollment') {
		switch (value) {
			case 'classroomName:asc':
			case 'classroomName:desc':
			case 'courseCode:asc':
			case 'courseCode:desc':
			case 'teacherName:asc':
			case 'teacherName:desc':
			case 'studentCount:asc':
			case 'studentCount:desc':
				return value;
		}
	}
	if (metric === 'equipment_inventory') {
		switch (value) {
			case 'classroomName:asc':
			case 'classroomName:desc':
			case 'buildingName:asc':
			case 'buildingName:desc':
			case 'equipmentType:asc':
			case 'equipmentType:desc':
			case 'conditionLabel:asc':
			case 'conditionLabel:desc':
				return value;
		}
	}
	return technologyDefaultSort(metric);
};

export const useAnalyticsFilters = (
	domain: ImplementedAnalyticsDomain = 'academic-load'
) => {
	const [searchParams, setSearchParams] = useSearchParams();
	const baseOptions = useAnalyticsFilterOptions();
	const data = baseOptions.data;
	const baseContext = data?.domainContexts[domain];
	const baseMonitoringContext = data?.domainContexts.monitoring;
	const requestedBuildingId = searchParams.get('buildingId');
	const effectiveBuildingId =
		domain === 'monitoring' && baseMonitoringContext
			? resolveDomainValue(
					baseMonitoringContext.filters.buildingId,
					baseMonitoringContext.options.buildings,
					requestedBuildingId,
					baseMonitoringContext.defaults.buildingId
				)
			: undefined;
	const requestedCenterId = searchParams.get('centerDepartmentId');
	const effectiveCenterId = baseContext
		? resolveDomainValue(
				baseContext.filters.centerDepartmentId,
				baseContext.options.centerDepartments,
				requestedCenterId,
				baseContext.defaults.centerDepartmentId
			)
		: undefined;
	const scopedOptions = useAnalyticsFilterOptions(
		effectiveCenterId,
		{ enabled: Boolean((effectiveCenterId || effectiveBuildingId) && data) },
		effectiveBuildingId
	);
	const effectiveOptions =
		effectiveCenterId || effectiveBuildingId ? scopedOptions.data : data;
	const context = effectiveOptions?.domainContexts[domain] ?? baseContext;
	const periodOptions = data?.options.periods ?? [];
	const requestedPeriodId = searchParams.get('periodId');
	const defaultPeriodId = data?.defaults.periodId ?? null;
	const effectivePeriodId = includesId(periodOptions, requestedPeriodId)
		? requestedPeriodId ?? undefined
		: includesId(periodOptions, defaultPeriodId)
			? defaultPeriodId ?? undefined
			: undefined;
	const requestedComparisonId = searchParams.get('comparisonPeriodId');
	const effectiveComparisonPeriodId =
		(domain === 'academic-load' || domain === 'enrollment') &&
		data?.capabilities.canComparePeriods &&
		includesId(periodOptions, requestedComparisonId) &&
		requestedComparisonId !== effectivePeriodId
			? requestedComparisonId ?? undefined
			: undefined;
	const requestedTeacherId = searchParams.get('teacherId');
	const effectiveTeacherId = context
		? resolveDomainValue(
				context.filters.teacherId,
				context.options.teachers,
				requestedTeacherId,
				context.defaults.teacherId
			)
		: undefined;
	const hasResolvedScope =
		(!effectiveCenterId && !effectiveBuildingId) || Boolean(scopedOptions.data);
	const domainAvailable = Boolean(data?.domains.includes(domain));
	const periodCenterFilters: PeriodCenterFilters | undefined =
		domainAvailable && hasResolvedScope && effectivePeriodId && context
			? {
					periodId: effectivePeriodId,
					...(effectiveCenterId
						? { centerDepartmentId: effectiveCenterId }
						: {}),
				}
			: undefined;
	const academicLoadFilters: AcademicLoadFilters | undefined =
		domain === 'academic-load' && periodCenterFilters
			? {
					...periodCenterFilters,
					...(effectiveComparisonPeriodId
						? { comparisonPeriodId: effectiveComparisonPeriodId }
						: {}),
					...(effectiveTeacherId ? { teacherId: effectiveTeacherId } : {}),
				}
			: undefined;
	const enrollmentFilters: EnrollmentFilters | undefined =
		domain === 'enrollment' && periodCenterFilters
			? {
					...periodCenterFilters,
					...(effectiveComparisonPeriodId
						? { comparisonPeriodId: effectiveComparisonPeriodId }
						: {}),
					...(effectiveTeacherId ? { teacherId: effectiveTeacherId } : {}),
				}
			: undefined;
	const rawDayOfWeek = searchParams.get('dayOfWeek');
	const dayOfWeek = isClassroomDayOfWeek(rawDayOfWeek) ? rawDayOfWeek : 'Lu';
	const requestedStartTime = searchParams.get('startTime') ?? '07:00';
	const requestedEndTime = searchParams.get('endTime') ?? '08:00';
	const requestedRangeIsValid =
		CANONICAL_TIME.test(requestedStartTime) &&
		CANONICAL_TIME.test(requestedEndTime) &&
		requestedStartTime < requestedEndTime;
	const startTime = requestedRangeIsValid ? requestedStartTime : '07:00';
	const endTime = requestedRangeIsValid ? requestedEndTime : '08:00';
	const classroomRangeIsValid = true;
	const classroomFilters =
		domain === 'classrooms' && periodCenterFilters && classroomRangeIsValid
			? { ...periodCenterFilters, dayOfWeek, startTime, endTime }
			: undefined;
	const staffContext = effectiveOptions?.domainContexts.staff;
	const catalogValue = (
		options: { id: string }[] | undefined,
		value: string | null
	) => (options && includesId(options, value) ? value ?? undefined : undefined);
	const staffFilters: StaffFilters | undefined =
		domain === 'staff' && domainAvailable && hasResolvedScope && staffContext
			? {
					...(effectiveCenterId
						? { centerDepartmentId: effectiveCenterId }
						: {}),
					...(effectiveTeacherId ? { teacherId: effectiveTeacherId } : {}),
					...(catalogValue(
						staffContext.catalogs.contractTypes,
						searchParams.get('contractTypeId')
					)
						? {
								contractTypeId: catalogValue(
									staffContext.catalogs.contractTypes,
									searchParams.get('contractTypeId')
								),
							}
						: {}),
					...(catalogValue(
						staffContext.catalogs.categories,
						searchParams.get('categoryId')
					)
						? {
								categoryId: catalogValue(
									staffContext.catalogs.categories,
									searchParams.get('categoryId')
								),
							}
						: {}),
					...(catalogValue(
						staffContext.catalogs.shifts,
						searchParams.get('shiftId')
					)
						? {
								shiftId: catalogValue(
									staffContext.catalogs.shifts,
									searchParams.get('shiftId')
								),
							}
						: {}),
					...(catalogValue(
						staffContext.catalogs.positions,
						searchParams.get('positionId')
					)
						? {
								positionId: catalogValue(
									staffContext.catalogs.positions,
									searchParams.get('positionId')
								),
							}
						: {}),
				}
			: undefined;
	const activityContext = effectiveOptions?.domainContexts.activities;
	const activityTimeMode: ActivityTimeMode =
		searchParams.get('activityTimeMode') === 'year' ? 'year' : 'period';
	const availableYears = activityContext?.catalogs.availableYears ?? [];
	const requestedYear = Number(searchParams.get('activityYear'));
	const activityYear = availableYears.includes(requestedYear)
		? requestedYear
		: availableYears[0];
	const rawPac = searchParams.get('activityPac');
	const rawPacModality = searchParams.get('activityPacModality');
	const selectedPac = rawPac ? Number(rawPac) : undefined;
	const validPacPair = periodOptions.some(
		period =>
			period.year === activityYear &&
			period.pac === selectedPac &&
			period.modality === rawPacModality
	);
	const activityFilters: ActivityFilters | undefined =
		domain === 'activities' &&
		domainAvailable &&
		hasResolvedScope &&
		activityContext &&
		((activityTimeMode === 'period' && effectivePeriodId) ||
			(activityTimeMode === 'year' && activityYear))
			? {
					...(activityTimeMode === 'period' && effectivePeriodId
						? { periodId: effectivePeriodId }
						: { year: String(activityYear) }),
					...(activityTimeMode === 'year' && validPacPair
						? { pac: String(selectedPac), pacModality: rawPacModality ?? '' }
						: {}),
					...(effectiveCenterId
						? { centerDepartmentId: effectiveCenterId }
						: {}),
					...(effectiveTeacherId ? { teacherId: effectiveTeacherId } : {}),
					...(catalogValue(
						activityContext.catalogs.activityTypes,
						searchParams.get('activityTypeId')
					)
						? {
								activityTypeId: catalogValue(
									activityContext.catalogs.activityTypes,
									searchParams.get('activityTypeId')
								),
							}
						: {}),
				}
			: undefined;
	const today = institutionalDate(new Date());
	const monthAgoDate = new Date();
	monthAgoDate.setDate(monthAgoDate.getDate() - 30);
	const defaultDateFrom = institutionalDate(monthAgoDate);
	const requestedDateFrom = searchParams.get('dateFrom');
	const requestedDateTo = searchParams.get('dateTo');
	const dateFrom =
		requestedDateFrom && CANONICAL_DATE.test(requestedDateFrom)
			? requestedDateFrom
			: defaultDateFrom;
	const dateTo =
		requestedDateTo && CANONICAL_DATE.test(requestedDateTo)
			? requestedDateTo
			: today;
	const monitoringFilters: MonitoringFilters | undefined =
		domain === 'monitoring' &&
		domainAvailable &&
		hasResolvedScope &&
		context &&
		dateFrom <= dateTo
			? {
					dateFrom,
					dateTo,
					...(effectivePeriodId ? { periodId: effectivePeriodId } : {}),
					...(effectiveBuildingId ? { buildingId: effectiveBuildingId } : {}),
					...(effectiveTeacherId ? { teacherId: effectiveTeacherId } : {}),
				}
			: undefined;

	const classroomView: ClassroomView =
		searchParams.get('classroomView') === 'capacity'
			? 'capacity'
			: 'availability';
	const pageParam =
		domain === 'academic-load'
			? 'loadPage'
			: domain === 'enrollment'
				? 'enrollmentPage'
				: domain === 'classrooms'
					? classroomView === 'capacity'
						? 'capacityPage'
						: 'classroomPage'
					: domain === 'technology'
						? 'technologyPage'
						: domain === 'staff'
							? 'staffPage'
							: domain === 'activities'
								? 'activityPage'
								: 'monitoringPage';
	const page = getPage(searchParams.get(pageParam));
	const rawLoadSort = searchParams.get('loadSort');
	const loadSort = isAcademicLoadDetailSort(rawLoadSort)
		? rawLoadSort
		: 'name:asc';
	const rawEnrollmentSort = searchParams.get('enrollmentSort');
	const enrollmentSort = isEnrollmentDetailSort(rawEnrollmentSort)
		? rawEnrollmentSort
		: 'courseCode:asc';
	const rawClassroomSort = searchParams.get('classroomSort');
	const classroomSort = isClassroomAvailabilitySort(rawClassroomSort)
		? rawClassroomSort
		: 'classroomName:asc';
	const rawCapacitySort = searchParams.get('capacitySort');
	const capacitySort = isClassroomCapacitySort(rawCapacitySort)
		? rawCapacitySort
		: 'classroomName:asc';
	const rawTechnologyMetric = searchParams.get('technologyMetric');
	const technologyMetric = isTechnologyDetailMetric(rawTechnologyMetric)
		? rawTechnologyMetric
		: 'equipped_classrooms';
	const technologyDetailSort = technologySort(
		technologyMetric,
		searchParams.get('technologySort')
	);
	const rawStaffSort = searchParams.get('staffSort');
	const staffSort = isStaffSort(rawStaffSort) ? rawStaffSort : 'name:asc';
	const rawActivitySort = searchParams.get('activitySort');
	const activitySort = isActivitySort(rawActivitySort)
		? rawActivitySort
		: 'activityName:asc';
	const monitoringMetric: MonitoringDetailMetric =
		searchParams.get('monitoringMetric') === 'digital_blackboard_use'
			? 'digital_blackboard_use'
			: 'monitoring_checks';
	const rawMonitoringSort = searchParams.get('monitoringSort');
	const monitoringSort: MonitoringDetailSort =
		rawMonitoringSort === 'checkDate:asc' ||
		rawMonitoringSort === 'teacherName:asc' ||
		rawMonitoringSort === 'teacherName:desc' ||
		rawMonitoringSort === 'buildingName:asc' ||
		rawMonitoringSort === 'buildingName:desc'
			? rawMonitoringSort
			: 'checkDate:desc';
	const rawTechnologyBreakdown = searchParams.get('technologyBreakdown');
	const technologyBreakdown: TechnologyBreakdown =
		rawTechnologyBreakdown === 'condition' ||
		rawTechnologyBreakdown === 'building'
			? rawTechnologyBreakdown
			: 'type';
	const rawStaffBreakdown = searchParams.get('staffBreakdown');
	const staffBreakdown: StaffBreakdown =
		rawStaffBreakdown === 'category' ||
		rawStaffBreakdown === 'shift' ||
		rawStaffBreakdown === 'position'
			? rawStaffBreakdown
			: 'contract';
	const rawActivityBreakdown = searchParams.get('activityBreakdown');
	const activityBreakdown: ActivityBreakdown =
		rawActivityBreakdown === 'period' ||
		rawActivityBreakdown === 'center' ||
		rawActivityBreakdown === 'teacher'
			? rawActivityBreakdown
			: 'type';
	const rawMonitoringBreakdown = searchParams.get('monitoringBreakdown');
	const monitoringBreakdown: MonitoringBreakdown =
		rawMonitoringBreakdown === 'teacher' ||
		rawMonitoringBreakdown === 'building' ||
		rawMonitoringBreakdown === 'center' ||
		rawMonitoringBreakdown === 'centerDepartment' ||
		rawMonitoringBreakdown === 'period'
			? rawMonitoringBreakdown
			: 'day';
	const canonicalSearchParams = buildCanonicalAnalyticsSearchParams({
		domain,
		periodId: effectivePeriodId,
		comparisonPeriodId: effectiveComparisonPeriodId,
		centerDepartmentId: effectiveCenterId,
		teacherId: effectiveTeacherId,
		dayOfWeek,
		startTime,
		endTime,
		classroomView,
		contractTypeId: staffFilters?.contractTypeId,
		categoryId: staffFilters?.categoryId,
		shiftId: staffFilters?.shiftId,
		positionId: staffFilters?.positionId,
		activityTypeId: activityFilters?.activityTypeId,
		activityTimeMode,
		activityYear,
		activityPac: validPacPair ? String(selectedPac) : undefined,
		activityPacModality: validPacPair
			? rawPacModality ?? undefined
			: undefined,
		page,
		loadSort,
		enrollmentSort,
		classroomSort,
		capacitySort,
		technologyMetric,
		technologySort: technologyDetailSort,
		technologyBreakdown,
		staffSort,
		staffBreakdown,
		activitySort,
		activityBreakdown,
		buildingId: effectiveBuildingId,
		dateFrom,
		dateTo,
		monitoringMetric,
		monitoringSort,
		monitoringBreakdown,
	});

	const updateParams = (
		updates: Record<string, string | null>,
		resetPage = true
	) => {
		setSearchParams(current => {
			const next = new URLSearchParams(current);
			for (const [key, value] of Object.entries(updates)) {
				if (value) next.set(key, value);
				else next.delete(key);
			}
			if (resetPage) next.delete(pageParam);
			return next;
		});
	};
	const setPage = (value: number) =>
		updateParams({ [pageParam]: value === 1 ? null : String(value) }, false);

	return {
		baseOptions,
		scopedOptions,
		options: data,
		effectiveOptions,
		context,
		academicLoadFilters,
		enrollmentFilters,
		enrollmentUsesDomainScope: false,
		classroomFilters,
		classroomUsesDomainScope: false,
		classroomIgnoresTeacherFilter: false,
		classroomCapacityFilters:
			domain === 'classrooms' ? periodCenterFilters : undefined,
		technologyFilters: domain === 'technology' ? periodCenterFilters : undefined,
		staffFilters,
		activityFilters,
		monitoringFilters,
		classroomRangeIsValid,
		canonicalSearchParams,
		isCanonicalReady: Boolean(data && context && hasResolvedScope),
		values: {
			periodId: effectivePeriodId,
			comparisonPeriodId: effectiveComparisonPeriodId,
			centerDepartmentId: effectiveCenterId,
			teacherId: effectiveTeacherId,
			dayOfWeek,
			startTime,
			endTime,
			contractTypeId: staffFilters?.contractTypeId,
			categoryId: staffFilters?.categoryId,
			shiftId: staffFilters?.shiftId,
			positionId: staffFilters?.positionId,
			activityTypeId: activityFilters?.activityTypeId,
			activityTimeMode,
			activityYear,
			activityPac: validPacPair ? String(selectedPac) : undefined,
			activityPacModality: validPacPair ? rawPacModality ?? undefined : undefined,
			classroomView,
			technologyBreakdown,
			staffBreakdown,
			activityBreakdown,
			buildingId: effectiveBuildingId,
			dateFrom,
			dateTo,
			monitoringBreakdown,
		},
		page,
		loadPage: domain === 'academic-load' ? page : 1,
		enrollmentPage: domain === 'enrollment' ? page : 1,
		classroomPage: domain === 'classrooms' ? page : 1,
		size: DETAILS_PAGE_SIZE,
		loadSort,
		enrollmentSort,
		classroomSort,
		capacitySort,
		technologyMetric,
		technologySort: technologyDetailSort,
		staffSort,
		activitySort,
		monitoringMetric,
		monitoringSort,
		isResolvingTeachers: Boolean(effectiveCenterId) && scopedOptions.isPending,
		setPage,
		setLoadPage: setPage,
		setEnrollmentPage: setPage,
		setClassroomPage: setPage,
		setPeriodId: (value: string) =>
			updateParams({
				periodId: value || null,
				...(requestedComparisonId === value
					? { comparisonPeriodId: null }
					: {}),
			}),
		setComparisonPeriodId: (value: string) =>
			updateParams({
				comparisonPeriodId:
					value && value !== effectivePeriodId ? value : null,
			}),
		setCenterDepartmentId: (value: string) =>
			updateParams({ centerDepartmentId: value || null, teacherId: null }),
		setTeacherId: (value: string) =>
			updateParams({ teacherId: value || null }),
		setBuildingId: (value: string) =>
			updateParams({ buildingId: value || null, teacherId: null }),
		setMonitoringDateRange: (start: string, end: string) =>
			updateParams({ dateFrom: start, dateTo: end }),
		setLoadSort: (value: AcademicLoadDetailSort) =>
			updateParams({ loadSort: value }),
		setEnrollmentSort: (value: EnrollmentDetailSort) =>
			updateParams({ enrollmentSort: value }),
		setClassroomSort: (value: ClassroomAvailabilitySort) =>
			updateParams({ classroomSort: value }),
		setCapacitySort: (value: ClassroomCapacitySort) =>
			updateParams({ capacitySort: value }),
		setTechnologyMetric: (value: TechnologyDetailMetric) =>
			updateParams({
				technologyMetric: value,
				technologySort: null,
			}),
		setTechnologySort: (value: TechnologyDetailSort) =>
			updateParams({ technologySort: value }),
		setStaffSort: (value: StaffDetailSort) =>
			updateParams({ staffSort: value }),
		setActivitySort: (value: ActivityDetailSort) =>
			updateParams({ activitySort: value }),
		setMonitoringMetric: (value: MonitoringDetailMetric) =>
			updateParams({ monitoringMetric: value }),
		setMonitoringSort: (value: MonitoringDetailSort) =>
			updateParams({ monitoringSort: value }),
		setMonitoringBreakdown: (value: MonitoringBreakdown) =>
			updateParams({ monitoringBreakdown: value }),
		setClassroomDayOfWeek: (value: string) => {
			if (isClassroomDayOfWeek(value)) updateParams({ dayOfWeek: value });
		},
		setClassroomStartTime: (value: string) =>
			updateParams({ startTime: value }),
		setClassroomEndTime: (value: string) => updateParams({ endTime: value }),
		setCatalogFilter: (key: string, value: string) =>
			updateParams({ [key]: value || null }),
		setActivityTimeMode: (value: ActivityTimeMode) =>
			updateParams({
				activityTimeMode: value,
				activityPac: null,
				activityPacModality: null,
			}),
		setActivityYear: (value: string) =>
			updateParams({
				activityYear: value,
				activityPac: null,
				activityPacModality: null,
			}),
		setActivityPacPair: (value: string) => {
			const selected = periodOptions.find(period => period.id === value);
			updateParams({
				activityPac: selected ? String(selected.pac) : null,
				activityPacModality: selected?.modality ?? null,
			});
		},
		resetFilters: () =>
			updateParams({
				periodId: null,
				comparisonPeriodId: null,
				centerDepartmentId: null,
				teacherId: null,
				contractTypeId: null,
				categoryId: null,
				shiftId: null,
				positionId: null,
				activityTypeId: null,
				activityTimeMode: null,
				activityYear: null,
				activityPac: null,
				activityPacModality: null,
				buildingId: null,
				dateFrom: null,
				dateTo: null,
				monitoringMetric: null,
				monitoringSort: null,
				monitoringBreakdown: null,
			}),
	};
};
