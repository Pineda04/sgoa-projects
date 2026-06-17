import { api } from "@lib/api/axios";
import { IResponse } from '@types';
//import { TFaculty } from "@features/centers";
import { TAcademicCommonProps } from "@features/teachers";

export const facultiesApi = {
    //Obtener todas las facultades
    getAllFaculties: () => api.get<IResponse<TAcademicCommonProps[]>>('faculties'),
}