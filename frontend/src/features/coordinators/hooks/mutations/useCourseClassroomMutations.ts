import { coordinatorsApi } from '@features/coordinators/api';
import { academicAssignmentReportKeys, courseKeys } from '@features/teachers';
import { queryClient } from '@lib/tanstack';
import { useMutation } from '@tanstack/react-query';
import { alertSuccess } from '@utils';

export const useDeleteCourseClassroom = () => {
	const { mutateAsync, isPending } = useMutation({
		mutationFn: (id: string) => coordinatorsApi.deleteCourseClassroom(id),
		onSuccess: async res => {
			try {
				await alertSuccess(res);
			} catch {
				// Ignore alert errors
			}

			queryClient.setQueryData(['courses'], () => []);
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ['courses'] });
		},
	});

	return {
		deleteCourseClassroom: mutateAsync,
		isPendingDeleteCourseClassroom: isPending,
	};
};

export const useChangeTeacherCourseClassroom = () => {
	const { mutateAsync, isPending } = useMutation({
		mutationFn: ({
			courseClassroomId,
			teacherId,
		}: {
			courseClassroomId: string;
			teacherId: string;
		}) =>
			coordinatorsApi.changeTeacherCourseClassroom(
				courseClassroomId,
				teacherId
			),
		onSuccess: async res => {
			try {
				await alertSuccess(res);
			} catch {
				// Ignore alert errors
			}

			await Promise.all([
				queryClient.invalidateQueries({
					queryKey: courseKeys.all,
				}),
				queryClient.invalidateQueries({
					queryKey: academicAssignmentReportKeys.all,
				}),
			]);
		},
	});

	return {
		changeTeacherCourseClassroom: mutateAsync,
		isPendingChangeTeacherCourseClassroom: isPending,
	};
};
