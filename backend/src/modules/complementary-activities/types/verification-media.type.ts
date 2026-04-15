export type TVerificationMedia = {
  id: string;
  description: string;
  // url: string | null;
  // multimediaTypeId: string;
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

export type TCreateVerificationMedia = Pick<
  TVerificationMedia,
  'description' | 'activityId'
> & { files: Express.Multer.File[] };
