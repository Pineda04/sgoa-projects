import { api } from '@config/lib';

export const complementaryActivitiesApi = {
	createComplementaryActivity: (formData: FormData) =>
		api.post(`/complementary-activities`, formData, {
			headers: {
				'Content-Type': 'multipart/form-data',
			},
		}),

	updateComplementaryActivity: (id: string, formData: FormData) =>
		api.patch(`/complementary-activities/files/${id}`, formData, {
			headers: {
				'Content-Type': 'multipart/form-data',
			},
		}),

	deleteComplementaryActivity: (id: string) =>
		api.delete(`/complementary-activities/${id}`),
};
