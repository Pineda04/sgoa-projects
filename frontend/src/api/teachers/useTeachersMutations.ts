import { useMutation } from "@tanstack/react-query";
import { queryClient } from '@config/lib';
import { academicAssignmentReportsKeys } from "../assignment-reports";
import { alertSuccess } from '@shared';
import { teachingSessionsApi } from "./teachers.api";
import { TTeachingSessionOmit } from "./teachers.types";

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
