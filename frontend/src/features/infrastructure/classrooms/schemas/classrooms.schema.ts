import { z } from 'zod';
import { TCreateClassroom } from '@api/classrooms';

const countField = (label: string) =>
	z
		.string()
		.trim()
		.min(1, `${label} es requerido`)
		.refine(
			value => /^\d+$/.test(value),
			`${label} debe ser un número entero mayor o igual a 0`
		);

const optionalUuidField = (label: string) =>
	z
		.string()
		.uuid(`${label} debe ser una opción válida`)
		.or(z.literal(''))
		.optional();

export const classroomSchema = z.object({
	name: z
		.string()
		.trim()
		.min(1, 'El nombre es requerido')
		.max(100, 'El nombre no puede superar los 100 caracteres'),
	desks: countField('El número de escritorios'),
	tables: countField('El número de mesas'),
	projectors: countField('El número de proyectores'),
	powerOutlets: countField('El número de tomacorrientes'),
	lights: countField('El número de luces'),
	blackboards: countField('El número de pizarras'),
	lecterns: countField('El número de atriles'),
	windows: countField('El número de ventanas'),
	maxCapacity: z
		.string()
		.trim()
		.refine(
			value => value === '' || /^\d+$/.test(value),
			'La capacidad máxima debe ser un número entero mayor o igual a 0'
		),
	activeStatus: z.boolean(),
	buildingId: z.string().uuid('El edificio es requerido'),
	roomTypeId: z.string().uuid('El tipo de aula es requerido'),
	connectivityId: optionalUuidField('La conectividad'),
	audioEquipmentId: optionalUuidField('El equipo de audio'),
	conditionId: optionalUuidField('La condición'),
	departmentIds: z.array(z.string().uuid()).optional(),
});

export type TClassroomFormValues = z.infer<typeof classroomSchema>;

export const initialClassroomValues: TClassroomFormValues = {
	name: '',
	desks: '',
	tables: '',
	projectors: '',
	powerOutlets: '',
	lights: '',
	blackboards: '',
	lecterns: '',
	windows: '',
	maxCapacity: '',
	activeStatus: true,
	buildingId: '',
	roomTypeId: '',
	connectivityId: '',
	audioEquipmentId: '',
	conditionId: '',
	departmentIds: [],
};

export const buildClassroomBody = (
	values: TClassroomFormValues
): TCreateClassroom => ({
	name: values.name.trim(),
	desks: Number(values.desks),
	tables: Number(values.tables),
	projectors: Number(values.projectors),
	powerOutlets: Number(values.powerOutlets),
	lights: Number(values.lights),
	blackboards: Number(values.blackboards),
	lecterns: Number(values.lecterns),
	windows: Number(values.windows),
	maxCapacity: values.maxCapacity ? Number(values.maxCapacity) : null,
	activeStatus: values.activeStatus,
	buildingId: values.buildingId,
	roomTypeId: values.roomTypeId,
	connectivityId: values.connectivityId || null,
	audioEquipmentId: values.audioEquipmentId || null,
	conditionId: values.conditionId || null,
	departmentIds: values.departmentIds ?? [],
});
