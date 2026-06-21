import { useMutation } from "@tanstack/react-query";
import { verificationMediasApi } from "./verification-medias.api";
import { alertSuccess } from '@shared';
import { queryClient } from '@config/lib';
import { academicAssignmentReportsKeys } from "../assignment-reports";

export const useDeleteVerificationMediaFile = (reportId: string) => {
	const { mutateAsync } = useMutation({
		mutationFn: (id: string) =>
			verificationMediasApi.deleteVerificationMediaFile(id),
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
		delVerificationMediaFile: mutateAsync,
	};
};
