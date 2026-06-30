import z from 'zod';

export const degreeNameSchema = z.object({
	name: z
		.string()
		.trim()
		.min(3, 'El nombre debe tener al menos 3 caracteres.')
		.max(150, 'El nombre no puede superar los 150 caracteres.'),
});

export type TCreateDegreeName = z.infer<typeof degreeNameSchema>;
export type TUpdateDegreeName = Partial<TCreateDegreeName>;

export const initialDegreeName: TCreateDegreeName = { name: '' };
