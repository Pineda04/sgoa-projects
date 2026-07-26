export type TMonitorReportSummary = {
  totalChecks: number;
  present: number;
  absent: number;
  complianceRate: number;
};

export type TMonitorReportGroup = TMonitorReportSummary & {
  groupKey: string;
  groupLabel: string;
};

export type TMonitorReport = TMonitorReportSummary & {
  groups?: TMonitorReportGroup[];
};
