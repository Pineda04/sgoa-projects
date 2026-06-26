import { queryClient } from "@config/lib";
import { useMutation } from "@tanstack/react-query";
import { alertSuccess } from "@shared/utils";
import { TCreateDepartment, TUpdateDepartment } from "@features/admin";
import { departmentsApi, departmentsKeys } from "../../api";

export const useCreateDepartment = () =>
    useMutation({
        mutationFn: (body: TCreateDepartment) => departmentsApi.createDepartment(body),
        onSuccess: async res => {
            alertSuccess(res);
            await Promise.all([
                queryClient.removeQueries({
                    queryKey: departmentsKeys.all,
                }),
                queryClient.removeQueries({
                    queryKey: departmentsKeys.allForTable,
                }),
                //todo: verificar si se ocuparia invalidar en mas lugares
            ]);
        },
    });

export const useUpdateDepartment = (departmentId: string) => {
    const action = departmentsApi.updateDepartment

    const { mutateAsync, isPending } = useMutation({
        mutationFn: ({ id, body }: { id: string, body: TUpdateDepartment }) =>
            action({ id, body }),
        onSuccess: async res => {
            alertSuccess(res)

            await Promise.all([
                queryClient.removeQueries({
                    queryKey: departmentsKeys.all,
                }),
                queryClient.removeQueries({
                    queryKey: departmentsKeys.allForTable,
                }),
                queryClient.removeQueries({
                    queryKey: departmentsKeys.detail(departmentId),
                }),
                //todo: verificar si se ocuparia invalidar en mas lugares
            ]);
        },
    });

    return { updateDepartment: mutateAsync, isPendingUpdate: isPending }
}

export const useDeleteDepartmentMutation = (departmentId: string) => {
    const { mutateAsync, isPending } = useMutation({
        mutationFn: (id: string) => departmentsApi.deleteDepartment(id),
        onSuccess: async res => {
            alertSuccess(res);

            await Promise.all([
                queryClient.removeQueries({
                    queryKey: departmentsKeys.all,
                }),
                queryClient.removeQueries({
                    queryKey: departmentsKeys.allForTable,
                }),
                queryClient.removeQueries({
                    queryKey: departmentsKeys.detail(departmentId),
                }),
                //todo: verificar si se ocuparia invalidar en mas lugares
            ]);
        },
    });

    return { deleteDepartment: mutateAsync, isPendingDelete: isPending };
};
