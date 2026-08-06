import z from 'zod';

export const departmentCreateSchema = z.object({
	name: z
		.string()
		.min(3, 'El nombre del departamento debe tener al menos 3 caracteres.')
		.max(
			150,
			'El nombre del departamento no puede superar los 150 caracteres.'
		),
	uvs: z
		.number({ error: 'Las unidades valorativas deben ser un número.' })
		.int('Las unidades valorativas deben ser un número entero.')
		.min(0, 'Las unidades valorativas no pueden ser negativas.')
		.optional()
		.nullable(),
	facultyId: z.uuidv4({ error: 'Debe seleccionar una facultad válida.' }),
});

export const departmentUpdateSchema = z
	.object({
		...departmentCreateSchema.shape,
	})
	.partial();

export type TCreateDepartment = z.infer<typeof departmentCreateSchema>;
export type TUpdateDepartment = z.infer<typeof departmentUpdateSchema>;

export const initialValuesDepartment: TCreateDepartment = {
	name: '',
	uvs: null,
	facultyId: '',
};
