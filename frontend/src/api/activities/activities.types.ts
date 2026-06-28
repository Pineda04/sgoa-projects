import { TVerificationMedia } from '@api/verification-medias';
import { complementaryActivitySchema } from '@features/academic';
import z from 'zod';

export type TCreateComplementaryActivity = z.infer<
	typeof complementaryActivitySchema
>;

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
