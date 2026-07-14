import { api } from '@config/lib';
import { IResponse } from '@shared/interfaces';
import { TBrand } from './brands.types';

export const brandsApi = {
	getAllBrands: () => api.get<IResponse<TBrand[]>>(`/brands`),
};
