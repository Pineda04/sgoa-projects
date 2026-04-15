import { TActivityType } from './activity-type.type';
import { TVerificationMedia } from './verification-media.type';

export type TComplementaryActivity = {
  id: string;
  isRegistered?: boolean | null;
  fileNumber?: string | null;
  progressLevel: string;
  assignmentReportId: string;
  activityTypeId: string;
  // assignmentReport?: TAssignmentReport;
  activityType: TActivityType;
  verificationMedia: TVerificationMedia | null;
};

// export type TCreateComplementaryActivity = Omit<
//   TComplementaryActivity,
//   'verificationMedias'
// >;

// export type TCustomComplementaryActivity<T> = Omit<TComplementaryActivity, (T as string)>;
// export type TCustomComplementaryActivity<
//   T extends keyof TComplementaryActivity,
// > = Omit<TComplementaryActivity, T>;
