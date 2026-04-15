import { alertSuccess } from '@utils';
import { academicAssignmentReportsCoordinatorApi } from '../../api';
import { useMutation } from '@tanstack/react-query';
import {
	TPlanification,
	TPlanificationWithErrors,
} from '../../schemas/planification.schemas';
import { queryClient } from '@lib/tanstack';
import { courseKeys } from '@features/teachers';

interface CreateAcademicAssignmentParams {
	centerDepartmentId: string;
	formData: FormData;
}

interface CreateAcademicAssignmentArrayParams {
	centerDepartmentId: string;
	assignments: TPlanification[];
}

export interface TCreateAcademicAssignmentArrayResponse {
	assignments: TPlanification[];
	invalidElements: TPlanificationWithErrors[];
}

interface ViewAcademicAssignmentParams {
	centerDepartmentId: string;
	formData: FormData;
}

export const useCreateAcademicAssignmentMutation = () => {
	return useMutation({
		mutationFn: ({
			centerDepartmentId,
			formData,
		}: CreateAcademicAssignmentParams) =>
			academicAssignmentReportsCoordinatorApi.createAcademicAssignment(
				centerDepartmentId,
				formData
			),
		onSuccess: alertSuccess,
	});
};

export const useCreateAcademicAssignmentArrayMutation = () => {
	return useMutation({
		mutationFn: ({
			centerDepartmentId,
			assignments,
		}: CreateAcademicAssignmentArrayParams) =>
			academicAssignmentReportsCoordinatorApi.createAcademicAssignmentArray(
				centerDepartmentId,
				assignments
			),
		onSuccess: async res => {
			alertSuccess(res);

			await queryClient.invalidateQueries({
				queryKey: courseKeys.all,
			});
		},
	});
};

export const useViewAcademicAssignmentMutation = () => {
	return useMutation({
		mutationFn: ({
			centerDepartmentId,
			formData,
		}: ViewAcademicAssignmentParams) =>
			academicAssignmentReportsCoordinatorApi.getAcademicAssignmentArray(
				centerDepartmentId,
				formData
			),
		onSuccess: alertSuccess,
	});
};
