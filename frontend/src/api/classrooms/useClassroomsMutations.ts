import { useMutation } from '@tanstack/react-query';
import { queryClient } from '@config/lib';
import { alertSuccess } from '@shared';
import { classroomsApi } from './classrooms.api';
import { classroomsKeys } from './classrooms.keys';
import { TCreateClassroom, TUpdateClassroom } from './classrooms.types';

export const useCreateClassroomMutation = () => {
	const { mutateAsync, isPending } = useMutation({
		mutationFn: (body: TCreateClassroom) =>
			classroomsApi.createClassroom(body),
		onSuccess: async res => {
			alertSuccess(res);
			await queryClient.invalidateQueries({
				queryKey: classroomsKeys.all,
			});
		},
	});
	return { createClassroom: mutateAsync, isPendingCreate: isPending };
};

export const useUpdateClassroomMutation = () => {
	const { mutateAsync, isPending } = useMutation({
		mutationFn: ({ id, body }: { id: string; body: TUpdateClassroom }) =>
			classroomsApi.updateClassroom({ id, body }),
		onSuccess: async res => {
			alertSuccess(res);
			await queryClient.invalidateQueries({
				queryKey: classroomsKeys.all,
			});
		},
	});
	return { updateClassroom: mutateAsync, isPendingUpdate: isPending };
};

export const useDeleteClassroomMutation = () => {
	const { mutateAsync, isPending } = useMutation({
		mutationFn: (id: string) => classroomsApi.deleteClassroom(id),
		onSuccess: async res => {
			alertSuccess(res);
			await queryClient.invalidateQueries({
				queryKey: classroomsKeys.all,
			});
		},
	});
	return { deleteClassroom: mutateAsync, isPendingDelete: isPending };
};
