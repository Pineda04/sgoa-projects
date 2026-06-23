import { useMutation } from "@tanstack/react-query";
import { ICreateAcademicAssignmentArrayParams, ICreateAcademicAssignmentParams, IViewAcademicAssignmentParams } from "./assignment-reports.interfaces";
import { alertSuccess } from '@shared';
import { queryClient } from '@config/lib';
import { coursesKeys } from "../courses";
import { academicAssignmentReportsApi } from "./assignment-reports.api";

export const useCreateAcademicAssignmentMutation = () => {
	return useMutation({
		mutationFn: ({
			centerDepartmentId,
			formData,
		}: ICreateAcademicAssignmentParams) =>
			academicAssignmentReportsApi.createAcademicAssignment(
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
		}: ICreateAcademicAssignmentArrayParams) =>
			academicAssignmentReportsApi.createAcademicAssignmentArray(
				centerDepartmentId,
				assignments
			),
		onSuccess: async res => {
			alertSuccess(res);

			await queryClient.invalidateQueries({
				queryKey: coursesKeys.all,
			});
		},
	});
};

export const useViewAcademicAssignmentMutation = () => {
	return useMutation({
		mutationFn: ({
			centerDepartmentId,
			formData,
		}: IViewAcademicAssignmentParams) =>
			academicAssignmentReportsApi.getAcademicAssignmentArray(
				centerDepartmentId,
				formData
			),
		onSuccess: alertSuccess,
	});
};
