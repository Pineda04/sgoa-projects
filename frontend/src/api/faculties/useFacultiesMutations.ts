import { queryClient } from "@config/lib";
import { useMutation } from "@tanstack/react-query";
import { alertSuccess } from "@shared/utils";
import { TCreateFaculty, TUpdateFaculty } from "@features/admin";
import { facultiesApi, facultiesKeys } from "../../api";

export const useCreateFaculty = () =>
    useMutation({
        mutationFn: (body: TCreateFaculty) => facultiesApi.createFaculty(body),
        onSuccess: async res => {
            alertSuccess(res);
            await queryClient.removeQueries({
                queryKey: facultiesKeys.all,
            });
        },
    });

export const useUpdateFaculty = (facultyId: string) => {
    const action = facultiesApi.updateFaculty

    const { mutateAsync, isPending } = useMutation({
        mutationFn: ({ id, body }: { id: string, body: TUpdateFaculty }) =>
            action({ id, body }),
        onSuccess: async res => {
            alertSuccess(res)

            await Promise.all([
                queryClient.removeQueries({
                    queryKey: facultiesKeys.all,
                }),
                queryClient.removeQueries({
                    queryKey: facultiesKeys.detail(facultyId),
                }),
            ]);
        },
    });

    return { updateFaculty: mutateAsync, isPendingUpdate: isPending }
}

export const useDeleteFacultyMutation = (facultyId: string) => {
    const { mutateAsync, isPending } = useMutation({
        mutationFn: (id: string) => facultiesApi.deleteFaculty(id),
        onSuccess: async res => {
            alertSuccess(res);

            await Promise.all([
                queryClient.removeQueries({
                    queryKey: facultiesKeys.all,
                }),
                queryClient.removeQueries({
                    queryKey: facultiesKeys.detail(facultyId),
                }),
            ]);
        },
    });

    return { deleteFaculty: mutateAsync, isPendingDelete: isPending };
};
