import { useMutation } from '@tanstack/react-query';
import { departmentsApi } from '../../api';
import { alertSuccess } from '@utils';
import { queryClient } from '@lib/tanstack';
import { departmentKeys } from '../../constants';

export const useDeleteDepartmentMutation = (departmentId: string) => {
    const { mutateAsync, isPending } = useMutation({
        mutationFn: (id: string) => departmentsApi.deleteDepartment(id),
        onSuccess: async res => {
            alertSuccess(res);

            await Promise.all([
                queryClient.removeQueries({
                    queryKey: departmentKeys.all,
                }),
                queryClient.removeQueries({
                    queryKey: departmentKeys.detail(departmentId),
                }),
                //todo: verificar si se ocuparia invalidar en mas lugares
            ]);
        },
    });

    return { deleteDepartment: mutateAsync, isPendingDelete: isPending };
};
