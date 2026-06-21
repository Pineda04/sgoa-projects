import { z } from 'zod';

export const courseCreateSchema = z.object({
	name: z.string().min(1, 'El nombre es requerido'),
	code: z
		.string()
		.min(1, 'El código es requerido')
		.regex(/^[A-Za-z0-9]+$/, 'Solo letras y números'),
	uvs: z.number().min(1, 'Mínimo 1 UV').max(5, 'Máximo 5 UV'),
	activeStatus: z.boolean().default(true),
	departmentId: z.string().min(1, 'El departamento es requerido'),
});

export const courseUpdateSchema = z.object({
	name: z.string().min(1, 'El nombre es requerido').optional(),
	code: z
		.string()
		.min(1, 'El código es requerido')
		.regex(/^[A-Za-z0-9]+$/, 'Solo letras y números')
		.optional(),
	uvs: z.number().min(1, 'Mínimo 1 UV').max(5, 'Máximo 5 UV').optional(),
	activeStatus: z.boolean().optional(),
	departmentId: z.string().optional(),
});

export const courseStadisticSchema = z.object({
	APB: z
		.number({ error: 'APB ser un número.' })
		.min(0, { error: 'El mínimo de APB es 0.' }),
	RPB: z
		.number({ error: 'RPB ser un número.' })
		.min(0, { error: 'El mínimo de RPB es 0.' }),
	NSP: z
		.number({ error: 'NSP ser un número.' })
		.min(0, { error: 'El mínimo de NSP es 0.' }),
	ABD: z
		.number({ error: 'ABD ser un número.' })
		.min(0, { error: 'El mínimo de ABD es 0.' }),
});
