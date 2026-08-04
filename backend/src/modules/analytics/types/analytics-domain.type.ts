export const ANALYTICS_DOMAINS = [
  'academic-load',
  'enrollment',
  'classrooms',
  'staff',
  'technology',
  'activities',
  'monitoring',
] as const;

export type AnalyticsDomain = (typeof ANALYTICS_DOMAINS)[number];
