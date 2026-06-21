import { api } from '@config/lib';

export const verificationMediasApi = {
	deleteVerificationMediaFile: (id: string) =>
		api.delete(`/verification-medias/file/personal/${id}`),
};
