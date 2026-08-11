import { AnalyticsDomain } from './analytics-domain.type';
import { AnalyticsScopeBranch } from './analytics-scope-branch.type';

export type AnalyticsContext = {
  userId: string;
  permissions: string[];
  isSuperAdmin: boolean;
  teacherId: string | null;
  centerDepartmentIds: string[];
  monitorBuildingIds: string[];
};

export type AnalyticsDomainScope = {
  domain: AnalyticsDomain;
  branches: AnalyticsScopeBranch[];
};

export type AnalyticsRequestedScope = {
  teacherId?: string;
  centerDepartmentIds?: string[];
  buildingIds?: string[];
};

export type AnalyticsEffectiveGlobalBranch = AnalyticsRequestedScope & {
  type: 'global';
};

export type AnalyticsEffectiveTeacherBranch = {
  type: 'teacher';
  teacherId: string;
};

export type AnalyticsEffectiveCenterDepartmentsBranch = {
  type: 'centerDepartments';
  centerDepartmentIds: string[];
  teacherId?: string;
};

export type AnalyticsEffectiveBuildingsBranch = {
  type: 'buildings';
  buildingIds: string[];
  centerDepartmentIds: string[];
  teacherId?: undefined;
};

export type AnalyticsEffectiveBranch =
  | AnalyticsEffectiveGlobalBranch
  | AnalyticsEffectiveTeacherBranch
  | AnalyticsEffectiveCenterDepartmentsBranch
  | AnalyticsEffectiveBuildingsBranch;

export type AnalyticsEffectiveScope = {
  domain: AnalyticsDomain;
  branches: AnalyticsEffectiveBranch[];
};
