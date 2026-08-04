export type AnalyticsDataStatus =
  | 'complete'
  | 'partial'
  | 'unavailable'
  | 'not_applicable';

export type AnalyticsMetricUnit =
  | 'sections'
  | 'courses'
  | 'uv'
  | 'enrollments'
  | 'classrooms'
  | 'capacity'
  | 'teachers'
  | 'activities'
  | 'equipment'
  | 'checks'
  | 'percentage';

export type AnalyticsCoverageReason =
  | 'missing_enrollment'
  | 'missing_classroom_capacity'
  | 'invalid_classroom_capacity'
  | 'invalid_schedule_days'
  | 'invalid_schedule_section'
  | 'missing_assignment_report'
  | 'unknown_digital_blackboard_use'
  | 'missing_digital_blackboard_use';

export type AnalyticsCoverage = {
  included: number;
  total: number;
  excluded: number;
  reasons: AnalyticsCoverageReason[];
};

export type AnalyticsMetricNote =
  | 'current_classroom_capacity'
  | 'current_classroom_catalog'
  | 'current_inventory_catalog'
  | 'potential_technology_coverage'
  | 'section_enrollments_not_unique_students'
  | 'current_staff_attributes'
  | 'current_position_catalog'
  | 'current_activity_type_catalog'
  | 'assignment_reports_without_workflow'
  | 'observed_digital_blackboard_use'
  | 'legacy_checks_without_blackboard_use_capture';

export type AnalyticsComparison = {
  current: number | null;
  comparison: number | null;
  absoluteChange: number | null;
  percentageChange: number | null;
  currentDataStatus: AnalyticsDataStatus;
  comparisonDataStatus: AnalyticsDataStatus;
  currentCoverage?: AnalyticsCoverage;
  comparisonCoverage?: AnalyticsCoverage;
};

export type AnalyticsMetricResult = {
  key: string;
  value: number | null;
  unit: AnalyticsMetricUnit;
  dataStatus: AnalyticsDataStatus;
  coverage?: AnalyticsCoverage;
  notes?: AnalyticsMetricNote[];
  numerator?: number;
  denominator?: number;
  comparison?: AnalyticsComparison | null;
};
