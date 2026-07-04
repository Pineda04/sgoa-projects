import { z } from 'zod';
import { TCreatePcEquipment } from '@api/pc-equipments';

export const pcEquipmentSchema = z.object({
	inventoryNumber: z
		.string()
		.trim()
		.min(1, 'El número de inventario es requerido')
		.max(50, 'El número de inventario no puede superar los 50 caracteres'),
	processor: z
		.string()
		.trim()
		.min(1, 'El procesador es requerido')
		.max(100, 'El procesador no puede superar los 100 caracteres'),
	ram: z
		.string()
		.trim()
		.min(1, 'La memoria RAM es requerida')
		.max(50, 'La memoria RAM no puede superar los 50 caracteres'),
	disk: z
		.string()
		.trim()
		.min(1, 'El disco es requerido')
		.max(100, 'El disco no puede superar los 100 caracteres'),
	brandId: z.string().min(1, 'La marca es requerida'),
	conditionId: z.string().min(1, 'La condición es requerida'),
	monitorTypeId: z.string().min(1, 'El tipo de monitor es requerido'),
	monitorSizeId: z.string().min(1, 'El tamaño de monitor es requerido'),
	pcTypeId: z.string().min(1, 'El tipo de PC es requerido'),
	classroomId: z.string().optional(),
	departmentId: z.string().optional(),
});

export type TPcEquipmentFormValues = z.infer<typeof pcEquipmentSchema>;

export const initialPcEquipmentValues: TPcEquipmentFormValues = {
	inventoryNumber: '',
	processor: '',
	ram: '',
	disk: '',
	brandId: '',
	conditionId: '',
	monitorTypeId: '',
	monitorSizeId: '',
	pcTypeId: '',
	classroomId: '',
	departmentId: '',
};

export const buildPcEquipmentBody = (
	values: TPcEquipmentFormValues
): TCreatePcEquipment => ({
	inventoryNumber: values.inventoryNumber.trim(),
	processor: values.processor.trim(),
	ram: values.ram.trim(),
	disk: values.disk.trim(),
	brandId: values.brandId,
	conditionId: values.conditionId,
	monitorTypeId: values.monitorTypeId,
	monitorSizeId: values.monitorSizeId,
	pcTypeId: values.pcTypeId,
	classroomId: values.classroomId || undefined,
	departmentId: values.departmentId || undefined,
});
