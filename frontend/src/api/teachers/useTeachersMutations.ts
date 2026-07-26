import { useMutation } from "@tanstack/react-query";
import { queryClient } from '@config/lib';
import { academicAssignmentReportsKeys } from "../assignment-reports";
import { alertSuccess } from '@shared';
import { teacherCategoriesApi, teachingSessionsApi } from "./teachers.api";
import { TTeachingSessionOmit } from "./teachers.types";
import { teacherCategoriesKeys } from "./teachers.keys";

export const useUpdateTeachingSession = (reportId: string) => {
	const { mutateAsync } = useMutation({
		mutationFn: ({
			courseClassroomId,
			body,
		}: {
			courseClassroomId: string;
			body: TTeachingSessionOmit;
		}) =>
			teachingSessionsApi.updateTeachingSession(
				courseClassroomId,
				body
			),
		onSuccess: async res => {
			try {
				await alertSuccess(res);
			} catch {
				// Ignore alert errors
			}

			await queryClient.invalidateQueries({
				queryKey: academicAssignmentReportsKeys.report(reportId),
			});
		},
	});

	return {
		updateTeachingSession: mutateAsync,
	};
};

export const useCreateTeacherCategory = () =>
	useMutation({
		mutationFn: (body: { name: string }) => teacherCategoriesApi.createTeacherCategory(body),
		onSuccess: async (res) => {
			alertSuccess(res);
			await queryClient.invalidateQueries({ queryKey: teacherCategoriesKeys.all });
		},
	});

export const useUpdateTeacherCategory = () => {
	const { mutateAsync, isPending } = useMutation({
		mutationFn: ({ id, body }: { id: string; body: { name: string } }) =>
			teacherCategoriesApi.updateTeacherCategory({ id, body }),
		onSuccess: async (res) => {
			alertSuccess(res);
			await queryClient.invalidateQueries({ queryKey: teacherCategoriesKeys.all });
		},
	});

	return { updateTeacherCategory: mutateAsync, isPendingUpdate: isPending };
};

export const useDeleteTeacherCategory = () => {
	const { mutateAsync, isPending } = useMutation({
		mutationFn: (id: string) => teacherCategoriesApi.deleteTeacherCategory(id),
		onSuccess: async (res) => {
			alertSuccess(res);
			await queryClient.invalidateQueries({ queryKey: teacherCategoriesKeys.all });
		},
	});

	return { deleteTeacherCategory: mutateAsync, isPendingDelete: isPending };
};
