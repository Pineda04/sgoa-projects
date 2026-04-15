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

export type TUpdateCourseClassroom = z.infer<typeof courseClassroomSchema>;
