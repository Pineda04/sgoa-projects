import { EActivityType, EPogressLevel } from '@shared/constants';
import z from 'zod';

export const complementaryActivitySchema = z
	.object({
		name: z
			.string()
			.min(3, {
				error: 'El nombre del proyecto debe tener al menos 3 caracteres.',
			})
			.max(250, {
				error: 'El nombre del proyecto no puede superar los 250 caracteres.',
			}),
		activityType: z.enum(Object.values(EActivityType)),
		progressLevel: z.enum(Object.values(EPogressLevel)).nullable(),

		description: z
			.string()
			.min(3, {
				error: 'La descripción del medio de verificación debe tener al menos 3 caracteres.',
			})
			.max(250, {
				error: 'La descripción del medio de verificación no puede superar los 250 caracteres.',
			}),

		// Registered
		isRegistered: z.boolean().optional(),
		fileNumber: z.string().optional().nullable(),
		assignmentReportId: z.uuidv4(),

		extraFieldsEnabled: z.boolean(),
	})
	.superRefine((data, ctx) => {
		if (!data.progressLevel) {
			ctx.addIssue({
				code: 'custom',
				message: `Debe seleccionar un nivel de progreso: ${Object.values(EPogressLevel).join(', ')}.`,
				path: ['progressLevel'],
			});
		}

		if (data.extraFieldsEnabled) {
			if (data.isRegistered === undefined) {
				ctx.addIssue({
					code: 'custom',
					message:
						'Debe seleccionar si la actividad está o no registrada.',
					path: ['isRegistered'],
				});
			}

			if (
				data.isRegistered === true &&
				(!data.fileNumber || data.fileNumber === '')
			) {
				ctx.addIssue({
					code: 'custom',
					message:
						'Si la actividad está registrada debe ingresar el número de expediente.',
					path: ['fileNumber'],
				});
			}
		}
	});
