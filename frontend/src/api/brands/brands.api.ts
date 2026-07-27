import { api } from '@config/lib';
import { IResponse } from '@shared/interfaces';
import { TBrand } from './brands.types';

export const brandsApi = {
  getAllBrands: () =>
    api.get<IResponse<TBrand[]>>(`/brands`),

	createBrand: (body: { name: string }) =>
		api.post<IResponse<TBrand>>(`/brands`, body),

	updateBrand: ({ id, body }: { id: string; body: { name: string } }) =>
		api.patch<IResponse<TBrand>>(`/brands/${id}`, body),

	deleteBrand: (id: string) =>
		api.delete<IResponse<void>>(`/brands/${id}`),
};
