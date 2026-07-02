import z from 'zod';

// Update CourseClassroom
export const courseClassroomSchema = z.object({
	teacherName: z.string({
		error: 'Debe seleccionar un docente válido.',
	}),
	teacherId: z.uuidv4({
		error: 'Debe seleccionar un docente válido.',
	}),
	courseClassroomId: z.uuidv4(),
});

// Editar los datos de una sección de asignatura (fila de planificación) ya existente.
export const editCourseClassroomSchema = z.object({
	courseId: z.uuidv4({
		error: 'Debe seleccionar una asignatura válida.',
	}),
	courseCode: z.string().min(1, {
		message: 'Debe seleccionar una asignatura válida.',
	}),
	courseName: z.string().min(1),
	classroomId: z.uuidv4({
		error: 'Debe seleccionar un aula válida.',
	}),
	classroomName: z.string().min(1),
	section: z.string().min(1, { message: 'La sección es obligatoria.' }),
	days: z.string().min(2, { message: 'Seleccione un día válido.' }),
	studentCount: z
		.number()
		.min(1, { message: 'Debe haber al menos un alumno.' })
		.max(100, {
			message: 'El número de alumnos no puede ser mayor a 100.',
		}),
	nearGraduation: z.boolean(),
	observation: z
		.string()
		.max(250, {
			message: 'Las observaciones no pueden superar los 250 caracteres.',
		})
		.optional(),
});
