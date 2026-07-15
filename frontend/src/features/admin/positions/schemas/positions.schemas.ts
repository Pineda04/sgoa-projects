import z from 'zod';

export const positionCreateSchema = z.object({
	name: z
		.string({ error: 'El nombre de la posición es obligatorio.' })
		.trim()
		.min(3, 'El nombre debe tener al menos 3 caracteres.')
		.max(50, 'El nombre no puede superar los 50 caracteres.'),
});

export const positionUpdateSchema = positionCreateSchema.partial();

export type TCreatePosition = z.infer<typeof positionCreateSchema>;
export type TUpdatePosition = z.infer<typeof positionUpdateSchema>;

export const initialValuesPosition: TCreatePosition = {
	name: '',
};
