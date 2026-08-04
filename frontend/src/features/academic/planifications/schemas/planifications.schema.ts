import z from 'zod';
import { isValidScheduleRange } from '@shared/utils';

export const planificationSchema = z
	.object({
		teacherCode: z
			.string()
			.min(1, { message: 'El código del docente es obligatorio.' }),
		teacherName: z
			.string()
			.min(3, {
				message:
					'El nombre del docente debe tener al menos 3 caracteres.',
			})
			.max(100, {
				message:
					'El nombre del docente no puede superar los 100 caracteres.',
			}),
		courseCode: z
			.string()
			.min(1, { message: 'El código de la asignatura es obligatorio.' }),
		courseName: z
			.string()
			.min(3, {
				message:
					'El nombre de la asignatura debe tener al menos 3 caracteres.',
			})
			.max(150, {
				message:
					'El nombre de la asignatura no puede superar los 150 caracteres.',
			}),
		uv: z.number().min(1, { message: 'UV debe ser al menos 1.' }),
		section: z.string().refine(isValidScheduleRange, {
			message: 'Seleccione un rango de horas válido.',
		}),
		studentCount: z
			.number()
			.min(0, { message: 'El número de alumnos no puede ser negativo.' })
			.nullable(),
		days: z.string().min(2, { message: 'Seleccione un día válido.' }),
		center: z.string().min(3, { message: 'El centro es obligatorio.' }),
		classroomName: z
			.string()
			.min(1, { message: 'El aula es obligatoria.' }),
		departmentName: z
			.string()
			.min(3, { message: 'El departamento es obligatorio.' }),
		coordinator: z
			.string()
			.min(3, { message: 'El coordinador es obligatorio.' }),
		nearGraduation: z.boolean(),
		observation: z
			.string()
			.max(250, {
				message:
					'Las observaciones no pueden superar los 250 caracteres.',
			})
			.optional(),
	})
	.superRefine((data, ctx) => {
		if (data.uv > 10) {
			ctx.addIssue({
				code: 'custom',
				message: 'UV no puede ser mayor a 10.', // estos realmente no se si sean necesarios
				path: ['uv'],
			});
		}

		if (data.studentCount !== null && data.studentCount > 100) {
			ctx.addIssue({
				code: 'custom',
				message: 'El número de alumnos no puede ser mayor a 100.', // igual este
				path: ['studentCount'],
			});
		}
	});
