import { api } from '@config/lib';
import { IResponse } from '@shared/interfaces';
import { TFaculty } from './faculties.types';

export const facultiesApi = {
    //Obtener todas las facultades
    getAllFaculties: () => api.get<IResponse<TFaculty[]>>('faculties'),
}