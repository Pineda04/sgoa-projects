import { useMutation } from "@tanstack/react-query";
import { departmentsApi } from "../../api";
import { alertSuccess } from "@utils";
import { queryClient } from "@lib/tanstack";
import { departmentKeys } from "../../constants";
import { TUpdateDepartment } from "../../schemas";

export const useUpdateDepartment = (departmentId: string) => {
    const action = departmentsApi.updateDepartment

    const { mutateAsync, isPending } = useMutation({
        mutationFn: ({ id, body }: { id: string, body: TUpdateDepartment }) =>
            action({ id, body }),
        onSuccess: async res => {
            alertSuccess(res)

            await Promise.all([
                queryClient.refetchQueries({
                    queryKey: departmentKeys.all,
                }),
                queryClient.refetchQueries({
                    queryKey: departmentKeys.detail(departmentId),
                }),
                //todo: verificar si se ocuparia invalidar en mas lugares
            ]);
        },
    });

    return { updateDepartment: mutateAsync, isPendingUpdate: isPending }
}