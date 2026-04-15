import { academicAssignmentReportsTeacherApi } from '@features/teachers/api';
import { academicAssignmentReportKeys } from '@features/teachers/constants';
import {
	TCourseStadisticOmit,
	TTeachingSessionOmit,
} from '@features/teachers/types';
import { queryClient } from '@lib/tanstack';
import { useMutation } from '@tanstack/react-query';
import { alertSuccess } from '@utils';

export const useCreateComplementaryActivity = (reportId: string) => {
	const { mutateAsync } = useMutation({
		mutationFn: (formData: FormData) =>
			academicAssignmentReportsTeacherApi.createComplementaryActivity(
				formData
			),
		onSuccess: async res => {
			try {
				await alertSuccess(res);
			} catch {
				// Ignore alert errors
			}

			await queryClient.invalidateQueries({
				queryKey: academicAssignmentReportKeys.report(reportId),
			});
		},
	});

	return {
		addComplementaryActivity: mutateAsync,
	};
};

export const useUpdateComplementaryActivity = (reportId: string) => {
	const { mutateAsync, isPending } = useMutation({
		mutationFn: ({ id, formData }: { id: string; formData: FormData }) =>
			academicAssignmentReportsTeacherApi.updateComplementaryActivity(
				id,
				formData
			),
		onSuccess: async res => {
			try {
				await alertSuccess(res);
			} catch {
				// Ignore alert errors
			}

			await queryClient.invalidateQueries({
				queryKey: academicAssignmentReportKeys.report(reportId),
			});
		},
	});

	return {
		updateComplementaryActivity: mutateAsync,
		isPendingUpdate: isPending,
	};
};

export const useDeleteComplementaryActivity = (reportId: string) => {
	const { mutateAsync } = useMutation({
		mutationFn: (id: string) =>
			academicAssignmentReportsTeacherApi.deleteComplementaryActivity(id),
		onSuccess: async res => {
			try {
				await alertSuccess(res);
			} catch {
				// Ignore alert errors
			}

			await queryClient.invalidateQueries({
				queryKey: academicAssignmentReportKeys.report(reportId),
			});
		},
	});

	return {
		delComplementaryActivity: mutateAsync,
	};
};

export const useDeleteVerificationMediaFile = (reportId: string) => {
	const { mutateAsync } = useMutation({
		mutationFn: (id: string) =>
			academicAssignmentReportsTeacherApi.deleteVerificationMediaFile(id),
		onSuccess: async res => {
			try {
				await alertSuccess(res);
			} catch {
				// Ignore alert errors
			}

			await queryClient.invalidateQueries({
				queryKey: academicAssignmentReportKeys.report(reportId),
			});
		},
	});

	return {
		delVerificationMediaFile: mutateAsync,
	};
};

// NOTE: PUEDEN IR EN OTRO ARCHIVO 'useTeachingSessionsMutations.ts'
// Actualizar tutoring y consult hour
export const useUpdateTeachingSession = (reportId: string) => {
	const { mutateAsync } = useMutation({
		mutationFn: ({
			courseClassroomId,
			body,
		}: {
			courseClassroomId: string;
			body: TTeachingSessionOmit;
		}) =>
			academicAssignmentReportsTeacherApi.updateTeachingSession(
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
				queryKey: academicAssignmentReportKeys.report(reportId),
			});
		},
	});

	return {
		updateTeachingSession: mutateAsync,
	};
};

// Actualizar estadísticas de curso
export const useUpdateCourseStadistic = (reportId: string) => {
	const { mutateAsync } = useMutation({
		mutationFn: ({
			courseClassroomId,
			body,
		}: {
			courseClassroomId: string;
			body: TCourseStadisticOmit;
		}) =>
			academicAssignmentReportsTeacherApi.updateCourseStadistic(
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
				queryKey: academicAssignmentReportKeys.report(reportId),
			});
		},
	});

	return {
		updateCourseStadistic: mutateAsync,
	};
};
