import { api } from '@lib/api/axios';
import { IResponse } from '@types';
import {
	TPacData,
	TAssignmentReport,
	TCourseStadisticOmit,
	TCourseStadistic,
	TTeachingSessionOmit,
	TTeachingSession,
} from '../types';

export const academicAssignmentReportsTeacherApi = {
	// Teaching Session
	updateCourseStadistic: (
		courseClassroomId: string,
		body: TCourseStadisticOmit
	) =>
		api.patch<IResponse<TCourseStadistic>>(
			`/course-stadistics/${courseClassroomId}`,
			body
		),

	updateTeachingSession: (
		teachingSessionId: string,
		body: TTeachingSessionOmit
	) =>
		api.patch<IResponse<Omit<TTeachingSession, 'courseClassrooms'>>>(
			`/teaching-sessions/${teachingSessionId}`,
			body
		),

	// Complementary activities
	createComplementaryActivity: (formData: FormData) =>
		api.post(`/complementary-activities`, formData, {
			headers: {
				'Content-Type': 'multipart/form-data',
			},
		}),

	updateComplementaryActivity: (id: string, formData: FormData) =>
		api.patch(`/complementary-activities/files/${id}`, formData, {
			headers: {
				'Content-Type': 'multipart/form-data',
			},
		}),

	deleteComplementaryActivity: (id: string) =>
		api.delete(`/complementary-activities/${id}`),

	deleteVerificationMediaFile: (id: string) =>
		api.delete(`/verification-medias/file/personal/${id}`),

	// Reports
	getAllAcademicAssignmentReportsOnlyPeriods: () =>
		api.get<
			IResponse<
				(TPacData & {
					centerDepartmentId: string;
					center: string;
					department: string;
					reportId: string; // academicAssignmentReportId
				})[]
			>
		>(`/academic-assignment-reports/periods`),

	// getAcademicAssignmentWithPeriodId: (periodId: string) =>
	// 	api.get<IResponse<TAssignmentReport>>(
	// 		`/academic-assignment-reports/my/period/${periodId}`
	// 	),
	//
	//

	getAcademicAssignmentReportById: (reportId: string) =>
		api.get<IResponse<TAssignmentReport>>(
			`/academic-assignment-reports/${reportId}`
		),

	getAcademicAssignmentWithPeriodIdAndCenterDepartment: (
		periodId: string,
		centerDepartmentId: string
	) =>
		api.get<IResponse<TAssignmentReport>>(
			`/academic-assignment-reports/my/period/${periodId}/center-department/${centerDepartmentId}`
		),
};
