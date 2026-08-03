import { z } from 'zod';
import { TCreateDigitalBlackboard } from '@api/digital-blackboards';

export const digitalBlackboardSchema = z.object({
	description: z
		.string()
		.trim()
		.max(255, 'La descripción no puede superar los 255 caracteres')
		.optional(),
	brandId: z
		.string()
		.min(1, 'La marca es requerida')
		.uuid('La marca debe ser un identificador válido'),
	monitorTypeId: z
		.string()
		.min(1, 'El tipo de monitor es requerido')
		.uuid('El tipo de monitor debe ser un identificador válido'),
	monitorSizeId: z
		.string()
		.min(1, 'El tamaño de monitor es requerido')
		.uuid('El tamaño de monitor debe ser un identificador válido'),
	conditionId: z
		.string()
		.min(1, 'La condición es requerida')
		.uuid('La condición debe ser un identificador válido'),
	classroomId: z.string().min(1, 'El aula es requerida'),
});

export type TDigitalBlackboardFormValues = z.infer<
	typeof digitalBlackboardSchema
>;

export const initialDigitalBlackboardValues: TDigitalBlackboardFormValues = {
	description: '',
	brandId: '',
	monitorTypeId: '',
	monitorSizeId: '',
	conditionId: '',
	classroomId: '',
};

export const buildDigitalBlackboardBody = (
	values: TDigitalBlackboardFormValues
): TCreateDigitalBlackboard => ({
	description: values.description?.trim() || null,
	brandId: values.brandId,
	monitorTypeId: values.monitorTypeId,
	monitorSizeId: values.monitorSizeId,
	conditionId: values.conditionId,
	classroomId: values.classroomId || undefined,
});
