import { TOutputDepartment } from "@features/centers";
import { api } from "@lib/api/axios";
import { IResponse } from "@types";
import { TCreateDepartment, TUpdateDepartment } from '../schemas';
import { TDepartment } from "@features/centers";

export const departmentsApi = {
  createDepartment: (body: TCreateDepartment) =>
    api.post<IResponse<TDepartment>>(`/departments`, body),

  //este endpoint en el BE no retorna paginacion
  getAllDepartments: () =>
    api.get<IResponse<TOutputDepartment[]>>(`/departments`),

  getOneDepartment: (id: string) =>
    api.get<IResponse<TDepartment>>(`/departments/${id}`),

  updateDepartment: ({ id, body }: { id: string, body: TUpdateDepartment }) =>
    api.patch<IResponse<TDepartment>>(`/departments/${id}`, body),

  deleteDepartment: (id: string) =>
    api.delete<IResponse<TDepartment>>(`/departments/${id}`),
}
