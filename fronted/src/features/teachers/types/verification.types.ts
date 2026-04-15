export type TVerificationMedia = {
	id: string;
	description: string;
	activityId: string;
	verificationMediaFiles: TVerificationMediaFile[];
};

export type TVerificationMediaFile = {
	id: string;
	url: string;
	public_id: string;
	multimediaTypeId: string;
	verificationMediaId: string;
};
