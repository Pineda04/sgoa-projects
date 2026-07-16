import { z } from 'zod';
import { TCreateAirConditioner } from '@api/air-conditioners';

export const airConditionerSchema = z.object({
	description: z.string().trim().max(255, 'La descripción no puede superar los 255 caracteres').optional(),
	brandId: z.string().min(1, 'La marca es requerida'),
	conditionId: z.string().min(1, 'La condición es requerida'),
	classroomId: z.string().min(1, 'El aula es requerida'),
});

export type TAirConditionerFormValues = z.infer<typeof airConditionerSchema>;

export const initialAirConditionerValues: TAirConditionerFormValues = {
	description: '',
	brandId: '',
	conditionId: '',
	classroomId: '',
};

export const buildAirConditionerBody = (
	values: TAirConditionerFormValues,
): TCreateAirConditioner => ({
	description: values.description?.trim() || null,
	brandId: values.brandId,
	conditionId: values.conditionId,
	classroomId: values.classroomId || undefined,
});
