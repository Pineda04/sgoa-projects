import { TVerificationMedia } from './verification.types';

export type TActivityType = {
	id: string;
	name: string;
	description?: string | null;
};

export type TComplementaryActivity = {
	id: string;
	name: string;
	isRegistered?: boolean | null;
	fileNumber?: string | null;
	progressLevel: string;
	assignmentReportId: string;
	activityTypeId: string;
	activityType: TActivityType;
	verificationMedia: TVerificationMedia;
};
