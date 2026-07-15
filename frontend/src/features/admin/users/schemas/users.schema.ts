import { TCreateUser } from '@api/users';
import { resetPasswordSchema } from '@features/auth';
import { EPosition, ROLE_NAMES } from '@shared/constants';
import { z } from 'zod';

export const userCreateSchema = z
	.object({
		name: z.string().min(3, 'El nombre es necesario.').max(150),
		email: z.email('El email debe seguir el formato example@unah.edu.com'),
		code: z
			.string()
			.min(3, 'El código tiene que ser como mínimo de 3.')
			.max(9, 'El código tiene que ser como máximo de 9.')
			.regex(/^\d+$/, 'El código solo puede contener números.'),
		undergradId: z.uuidv4({
			error: 'Debe seleccionar un pregrado válido.',
		}),
		postgradId: z
			.uuidv4({ error: 'Debe seleccionar un postgrado válido.' })
			.optional()
			.nullable()
			.or(z.literal('')),
		categoryId: z.uuidv4({
			error: 'Debe seleccionar una categoría válido.',
		}),
		contractTypeId: z.uuidv4({
			error: 'Debe seleccionar un tipo de contratación válido.',
		}),
		shiftId: z.uuidv4({ error: 'Debe seleccionar una jornada válida.' }),
		// password: z.string().nullable(),
		// passwordConfirm: z.string().nullable(),
		centerId: z.uuidv4({ error: 'Debe seleccionar un centro válido.' }),
		centerDepartmentId: z.uuidv4({
			error: 'Debe seleccionar un departamento válido.',
		}),

		// Extras
		positionId: z
			.uuidv4({ error: 'Debe seleccionar un cargo académico válido.' })
			.optional()
			.or(z.literal(''))
			.transform(val => (val === '' ? undefined : val)),
		positionName: z.string().optional().nullable().or(z.literal('')),
		roles: z.array(z.string()).optional(),

		extraFieldsEnabled: z.boolean(),
	})
	.superRefine((data, ctx) => {
		if (data.extraFieldsEnabled) {
			if (!data.positionId) {
				ctx.addIssue({
					code: 'custom',
					message: 'Debe seleccionar un cargo académico válido.',
					path: ['positionId'],
				});
			}

			if (data.roles?.length === 0) {
				ctx.addIssue({
					code: 'custom',
					message: 'Debe seleccionar al menos un rol de acceso.',
					path: ['roles'],
				});
			}

			if (data.roles && data.roles.length > 0 && data.positionName) {
				if (
					data.roles.includes(ROLE_NAMES.COORDINADOR_AREA) &&
					data.positionName !== EPosition.DEPARTMENT_HEAD
				) {
					ctx.addIssue({
						code: 'custom',
						message:
							'Si se seleccionó el rol <COORDINADOR_AREA> debe seleccionar el cargo académico de <Jefe de Departamento>.',
						path: ['positionId'],
					});
				}

				if (
					data.positionName === EPosition.DEPARTMENT_HEAD &&
					!data.roles.includes(ROLE_NAMES.COORDINADOR_AREA)
				) {
					ctx.addIssue({
						code: 'custom',
						message:
							'Si se seleccionó el cargo académico de <Jefe de Departamento> debe seleccionar el rol <COORDINADOR_AREA>.',
						path: ['roles'],
					});
				}
			}
		}
	});

export const userUpdateSchema = z
	.object({
		...userCreateSchema.shape,
		...resetPasswordSchema.shape,
		shiftStart: z.iso.time().nullable().or(z.literal('')),
		shiftEnd: z.iso.time().nullable().or(z.literal('')),
	})
	.partial();

export const initialValuesUser = Object.fromEntries(
	Object.keys(userCreateSchema.shape).map(key => [key, ''])
) as Record<keyof TCreateUser, string>;
