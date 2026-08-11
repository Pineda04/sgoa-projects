import { useMutation } from '@tanstack/react-query';
import { useQueryClient } from '@tanstack/react-query';
import {
	courseClassroomsApi,
	coursesApi,
	courseStadisticsApi,
} from './courses.api';
import { alertSuccess } from '@shared';
import {
	ICreateCourse,
	IUpdateCourse,
	IUpdateCourseClassroom,
} from './courses.interfaces';
import { queryClient } from '@config';
import { coursesKeys } from './courses.keys';
import { TCourseStadisticOmit } from './courses.types';
import {
	academicAssignmentCoordinatorKeys,
	academicAssignmentReportsKeys,
} from '../assignment-reports';

// Actualiza una clase
export const useUpdateCourse = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: IUpdateCourse }) =>
			coursesApi.updateCourse(id, data),
		onSuccess: async res => {
			await alertSuccess(res);

			await queryClient.invalidateQueries({ queryKey: ['courses'] });
		},
	});
};

// Crea una nueva clase
export const useCreateCourse = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: ICreateCourse) => coursesApi.createCourse(data),
		onSuccess: async res => {
			await alertSuccess(res);

			await queryClient.invalidateQueries({ queryKey: ['courses'] });
		},
	});
};

// Eliminar una sección de clase
export const useDeleteCourseClassroom = () => {
	const { mutateAsync, isPending } = useMutation({
		mutationFn: (id: string) =>
			courseClassroomsApi.deleteCourseClassroom(id),
		onSuccess: async res => {
			try {
				await alertSuccess(res);
			} catch {
				// Ignore alert errors
			}

			await Promise.all([
				queryClient.invalidateQueries({ queryKey: coursesKeys.all }),
				queryClient.invalidateQueries({
					queryKey: academicAssignmentReportsKeys.all,
				}),
				queryClient.invalidateQueries({
					queryKey: academicAssignmentCoordinatorKeys.all,
				}),
			]);
		},
	});

	return {
		deleteCourseClassroom: mutateAsync,
		isPendingDeleteCourseClassroom: isPending,
	};
};

// Actualiza los datos de una sección de clase (fila de planificación)
export const useUpdateCourseClassroom = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			id,
			data,
		}: {
			id: string;
			data: IUpdateCourseClassroom;
		}) => courseClassroomsApi.updateCourseClassroom(id, data),
		onSuccess: async (res, { id }) => {
			try {
				await alertSuccess(res);
			} catch {
				// Ignorar los errores
			}

			await Promise.all([
				queryClient.invalidateQueries({ queryKey: coursesKeys.all }),
				queryClient.invalidateQueries({
					queryKey: ['courseClassrooms', 'detail', id],
				}),
				queryClient.invalidateQueries({
					queryKey: academicAssignmentReportsKeys.all,
				}),
				queryClient.invalidateQueries({
					queryKey: academicAssignmentCoordinatorKeys.all,
				}),
			]);
		},
	});
};

// Cambiar el profesor de una sección de clase
export const useChangeTeacherCourseClassroom = () => {
	const { mutateAsync, isPending } = useMutation({
		mutationFn: ({
			courseClassroomId,
			teacherId,
		}: {
			courseClassroomId: string;
			teacherId: string;
		}) =>
			courseClassroomsApi.changeTeacherCourseClassroom(
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
					queryKey: coursesKeys.all,
				}),
				queryClient.invalidateQueries({
					queryKey: academicAssignmentReportsKeys.all,
				}),
				queryClient.invalidateQueries({
					queryKey: academicAssignmentCoordinatorKeys.all,
				}),
			]);
		},
	});

	return {
		changeTeacherCourseClassroom: mutateAsync,
		isPendingChangeTeacherCourseClassroom: isPending,
	};
};

export const useUpdateCourseStadistic = (reportId: string) => {
	const { mutateAsync } = useMutation({
		mutationFn: ({
			courseClassroomId,
			body,
		}: {
			courseClassroomId: string;
			body: TCourseStadisticOmit;
		}) =>
			courseStadisticsApi.updateCourseStadistic(courseClassroomId, body),
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
		updateCourseStadistic: mutateAsync,
	};
};
