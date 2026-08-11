export type AnalyticsGlobalScopeBranch = {
  type: 'global';
};

export type AnalyticsTeacherScopeBranch = {
  type: 'teacher';
  teacherId: string;
};

export type AnalyticsCenterDepartmentsScopeBranch = {
  type: 'centerDepartments';
  centerDepartmentIds: string[];
};

export type AnalyticsBuildingsScopeBranch = {
  type: 'buildings';
  buildingIds: string[];
  centerDepartmentIds: string[];
};

export type AnalyticsScopeBranch =
  | AnalyticsGlobalScopeBranch
  | AnalyticsTeacherScopeBranch
  | AnalyticsCenterDepartmentsScopeBranch
  | AnalyticsBuildingsScopeBranch;
