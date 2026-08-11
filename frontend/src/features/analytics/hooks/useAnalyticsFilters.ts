import {
	isClassroomDayOfWeek,
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
import { useAnalyticsSearchParams } from './analytics-search-params';

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

const technologyDefaultSort = (
	metric: TechnologyDetailMetric
): TechnologyDetailSort => {
	if (metric === 'equipped_classrooms') return 'classroomName:asc';
	if (metric === 'equipped_classroom_enrollment') return 'courseCode:asc';
	return 'equipmentType:asc';
};

const technologySort = (
	metric: TechnologyDetailMetric,
	value: TechnologyDetailSort
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
	const [query, setQuery] = useAnalyticsSearchParams();
	const baseOptions = useAnalyticsFilterOptions();
	const data = baseOptions.data;
	const baseContext = data?.domainContexts[domain];
	const baseMonitoringContext = data?.domainContexts.monitoring;
	const requestedBuildingId = query.buildingId;
	const effectiveBuildingId =
		domain === 'monitoring' && baseMonitoringContext
			? resolveDomainValue(
					baseMonitoringContext.filters.buildingId,
					baseMonitoringContext.options.buildings,
					requestedBuildingId,
					baseMonitoringContext.defaults.buildingId
				)
			: undefined;
	const requestedCenterId = query.centerDepartmentId;
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
		{
			enabled: Boolean(
				(effectiveCenterId || effectiveBuildingId) && data
			),
		},
		effectiveBuildingId
	);
	const effectiveOptions =
		effectiveCenterId || effectiveBuildingId ? scopedOptions.data : data;
	const context = effectiveOptions?.domainContexts[domain] ?? baseContext;
	const periodOptions = data?.options.periods ?? [];
	const requestedPeriodId = query.periodId;
	const defaultPeriodId = data?.defaults.periodId ?? null;
	const effectivePeriodId = includesId(periodOptions, requestedPeriodId)
		? (requestedPeriodId ?? undefined)
		: includesId(periodOptions, defaultPeriodId)
			? (defaultPeriodId ?? undefined)
			: undefined;
	const requestedComparisonId = query.comparisonPeriodId;
	const effectiveComparisonPeriodId =
		(domain === 'academic-load' || domain === 'enrollment') &&
		data?.capabilities.canComparePeriods &&
		includesId(periodOptions, requestedComparisonId) &&
		requestedComparisonId !== effectivePeriodId
			? (requestedComparisonId ?? undefined)
			: undefined;
	const requestedTeacherId = query.teacherId;
	const effectiveTeacherId = context
		? resolveDomainValue(
				context.filters.teacherId,
				context.options.teachers,
				requestedTeacherId,
				context.defaults.teacherId
			)
		: undefined;
	const hasResolvedScope =
		(!effectiveCenterId && !effectiveBuildingId) ||
		Boolean(scopedOptions.data);
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
					...(effectiveTeacherId
						? { teacherId: effectiveTeacherId }
						: {}),
				}
			: undefined;
	const enrollmentFilters: EnrollmentFilters | undefined =
		domain === 'enrollment' && periodCenterFilters
			? {
					...periodCenterFilters,
					...(effectiveComparisonPeriodId
						? { comparisonPeriodId: effectiveComparisonPeriodId }
						: {}),
					...(effectiveTeacherId
						? { teacherId: effectiveTeacherId }
						: {}),
				}
			: undefined;
	const dayOfWeek = query.dayOfWeek;
	const requestedStartTime = query.startTime;
	const requestedEndTime = query.endTime;
	const requestedRangeIsValid = requestedStartTime < requestedEndTime;
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
	) =>
		options && includesId(options, value)
			? (value ?? undefined)
			: undefined;
	const staffFilters: StaffFilters | undefined =
		domain === 'staff' &&
		domainAvailable &&
		hasResolvedScope &&
		staffContext
			? {
					...(effectiveCenterId
						? { centerDepartmentId: effectiveCenterId }
						: {}),
					...(effectiveTeacherId
						? { teacherId: effectiveTeacherId }
						: {}),
					...(catalogValue(
						staffContext.catalogs.contractTypes,
						query.contractTypeId
					)
						? {
								contractTypeId: catalogValue(
									staffContext.catalogs.contractTypes,
									query.contractTypeId
								),
							}
						: {}),
					...(catalogValue(
						staffContext.catalogs.categories,
						query.categoryId
					)
						? {
								categoryId: catalogValue(
									staffContext.catalogs.categories,
									query.categoryId
								),
							}
						: {}),
					...(catalogValue(
						staffContext.catalogs.shifts,
						query.shiftId
					)
						? {
								shiftId: catalogValue(
									staffContext.catalogs.shifts,
									query.shiftId
								),
							}
						: {}),
					...(catalogValue(
						staffContext.catalogs.positions,
						query.positionId
					)
						? {
								positionId: catalogValue(
									staffContext.catalogs.positions,
									query.positionId
								),
							}
						: {}),
				}
			: undefined;
	const activityContext = effectiveOptions?.domainContexts.activities;
	const activityTimeMode: ActivityTimeMode = query.activityTimeMode;
	const availableYears = activityContext?.catalogs.availableYears ?? [];
	const requestedYear = query.activityYear ?? Number.NaN;
	const activityYear = availableYears.includes(requestedYear)
		? requestedYear
		: availableYears[0];
	const rawPac = query.activityPac;
	const rawPacModality = query.activityPacModality;
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
						? {
								pac: String(selectedPac),
								pacModality: rawPacModality ?? '',
							}
						: {}),
					...(effectiveCenterId
						? { centerDepartmentId: effectiveCenterId }
						: {}),
					...(effectiveTeacherId
						? { teacherId: effectiveTeacherId }
						: {}),
					...(catalogValue(
						activityContext.catalogs.activityTypes,
						query.activityTypeId
					)
						? {
								activityTypeId: catalogValue(
									activityContext.catalogs.activityTypes,
									query.activityTypeId
								),
							}
						: {}),
				}
			: undefined;
	const today = institutionalDate(new Date());
	const monthAgoDate = new Date();
	monthAgoDate.setDate(monthAgoDate.getDate() - 30);
	const defaultDateFrom = institutionalDate(monthAgoDate);
	const requestedDateFrom = query.dateFrom;
	const requestedDateTo = query.dateTo;
	const dateFrom = requestedDateFrom ?? defaultDateFrom;
	const dateTo = requestedDateTo ?? today;
	const monitoringFilters: MonitoringFilters | undefined =
		domain === 'monitoring' &&
		domainAvailable &&
		hasResolvedScope &&
		context &&
		dateFrom <= dateTo
			? {
					dateFrom,
					dateTo,
					...(effectivePeriodId
						? { periodId: effectivePeriodId }
						: {}),
					...(effectiveBuildingId
						? { buildingId: effectiveBuildingId }
						: {}),
					...(effectiveTeacherId
						? { teacherId: effectiveTeacherId }
						: {}),
				}
			: undefined;

	const classroomView: ClassroomView = query.classroomView;
	const page =
		domain === 'academic-load'
			? query.loadPage
			: domain === 'enrollment'
				? query.enrollmentPage
				: domain === 'classrooms'
					? classroomView === 'capacity'
						? query.capacityPage
						: query.classroomPage
					: domain === 'technology'
						? query.technologyPage
						: domain === 'staff'
							? query.staffPage
							: domain === 'activities'
								? query.activityPage
								: query.monitoringPage;
	const loadSort = query.loadSort;
	const enrollmentSort = query.enrollmentSort;
	const classroomSort = query.classroomSort;
	const capacitySort = query.capacitySort;
	const technologyMetric = query.technologyMetric;
	const technologyDetailSort = technologySort(
		technologyMetric,
		query.technologySort
	);
	const staffSort = query.staffSort;
	const activitySort = query.activitySort;
	const monitoringMetric: MonitoringDetailMetric = query.monitoringMetric;
	const monitoringSort: MonitoringDetailSort = query.monitoringSort;
	const technologyBreakdown: TechnologyBreakdown = query.technologyBreakdown;
	const staffBreakdown: StaffBreakdown = query.staffBreakdown;
	const activityBreakdown: ActivityBreakdown = query.activityBreakdown;
	const monitoringBreakdown: MonitoringBreakdown = query.monitoringBreakdown;
	type QueryUpdates = Partial<{
		[Key in keyof typeof query]: (typeof query)[Key] | null;
	}>;
	const pageReset = {
		loadPage: null,
		enrollmentPage: null,
		classroomPage: null,
		capacityPage: null,
		technologyPage: null,
		staffPage: null,
		activityPage: null,
		monitoringPage: null,
	} satisfies QueryUpdates;
	const updateParams = (updates: QueryUpdates, resetPage = true) => {
		void setQuery(resetPage ? { ...updates, ...pageReset } : updates);
	};
	const setPage = (value: number) => {
		const nextPage = value === 1 ? null : value;
		if (domain === 'academic-load')
			updateParams({ loadPage: nextPage }, false);
		else if (domain === 'enrollment')
			updateParams({ enrollmentPage: nextPage }, false);
		else if (domain === 'classrooms' && classroomView === 'capacity')
			updateParams({ capacityPage: nextPage }, false);
		else if (domain === 'classrooms')
			updateParams({ classroomPage: nextPage }, false);
		else if (domain === 'technology')
			updateParams({ technologyPage: nextPage }, false);
		else if (domain === 'staff')
			updateParams({ staffPage: nextPage }, false);
		else if (domain === 'activities')
			updateParams({ activityPage: nextPage }, false);
		else updateParams({ monitoringPage: nextPage }, false);
	};

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
		technologyFilters:
			domain === 'technology' ? periodCenterFilters : undefined,
		staffFilters,
		activityFilters,
		monitoringFilters,
		classroomRangeIsValid,
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
			activityPacModality: validPacPair
				? (rawPacModality ?? undefined)
				: undefined,
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
		isResolvingTeachers:
			Boolean(effectiveCenterId) && scopedOptions.isPending,
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
			updateParams({
				centerDepartmentId: value || null,
				teacherId: null,
			}),
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
		setTechnologyBreakdown: (value: TechnologyBreakdown) =>
			updateParams({ technologyBreakdown: value }),
		setStaffBreakdown: (value: StaffBreakdown) =>
			updateParams({ staffBreakdown: value }),
		setActivityBreakdown: (value: ActivityBreakdown) =>
			updateParams({ activityBreakdown: value }),
		setClassroomView: (value: ClassroomView) =>
			updateParams({
				classroomView: value,
				classroomPage: null,
				capacityPage: null,
			}),
		setClassroomDayOfWeek: (value: string) => {
			if (isClassroomDayOfWeek(value)) updateParams({ dayOfWeek: value });
		},
		setClassroomStartTime: (value: string) =>
			updateParams({ startTime: value }),
		setClassroomEndTime: (value: string) =>
			updateParams({ endTime: value }),
		setCatalogFilter: (
			key:
				| 'contractTypeId'
				| 'categoryId'
				| 'shiftId'
				| 'positionId'
				| 'activityTypeId',
			value: string
		) => updateParams({ [key]: value || null }),
		setActivityTimeMode: (value: ActivityTimeMode) =>
			updateParams({
				activityTimeMode: value,
				activityPac: null,
				activityPacModality: null,
			}),
		setActivityYear: (value: string) =>
			updateParams({
				activityYear: value ? Number(value) : null,
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
