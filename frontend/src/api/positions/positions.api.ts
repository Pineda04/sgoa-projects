import { api } from '@config/lib';
import { IResponse } from '@shared';
import { TAcademicCommonProps } from '../periods/periods.types';
import {
    TCreatePosition,
    TOutputPosition,
    TUpdatePosition,
} from './positions.types';

export const positionsApi = {
    getAllPositions: () =>
        api.get<IResponse<TAcademicCommonProps[]>>(`/positions`),

    getAllPositionsForTable: () =>
        api.get<IResponse<TOutputPosition[]>>(`/positions`),

    createPosition: (body: TCreatePosition) =>
        api.post<IResponse<TOutputPosition>>(`/positions`, body),

    getOnePosition: (id: string) =>
        api.get<IResponse<TOutputPosition>>(`/positions/${id}`),

    updatePosition: ({ id, body }: { id: string; body: TUpdatePosition }) =>
        api.patch<IResponse<TOutputPosition>>(`/positions/${id}`, body),

    deletePosition: (id: string) =>
        api.delete<IResponse<TOutputPosition>>(`/positions/${id}`),
};