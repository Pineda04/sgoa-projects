import { queryClient } from "@lib/tanstack";
import { useMutation } from "@tanstack/react-query";
import { alertSuccess } from "@utils";
import { TCreateDepartment } from '../../schemas';
import { departmentsApi } from "../../api";
import { departmentKeys } from "../../constants";

export const useCreateDepartment = () =>
    useMutation({
        mutationFn: (body: TCreateDepartment) => departmentsApi.createDepartment(body),
        onSuccess: async res => {
            alertSuccess(res);
            await Promise.all([
                queryClient.removeQueries({
                    queryKey: departmentKeys.all,
                }),
                //todo: verificar si se ocuparia invalidar en mas lugares
            ]);
        },
    });
