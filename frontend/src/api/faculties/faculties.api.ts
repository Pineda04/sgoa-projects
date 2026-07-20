import { api } from '@config/lib';
import { IResponse } from '@shared/interfaces';
import { TFaculty } from './faculties.types';
import { TCreateFaculty, TUpdateFaculty } from '@features/admin';

export const facultiesApi = {
    //Obtener todas las facultades
    getAllFaculties: () => api.get<IResponse<TFaculty[]>>('faculties'),

    createFaculty: (body: TCreateFaculty) =>
        api.post<IResponse<TFaculty>>('faculties', body),

    getOneFaculty: (id: string) =>
        api.get<IResponse<TFaculty>>(`faculties/${id}`),

    updateFaculty: ({ id, body }: { id: string, body: TUpdateFaculty }) =>
        api.patch<IResponse<TFaculty>>(`faculties/${id}`, body),

    deleteFaculty: (id: string) =>
        api.delete<IResponse<TFaculty>>(`faculties/${id}`),
}