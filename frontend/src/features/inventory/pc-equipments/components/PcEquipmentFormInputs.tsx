import type { FormikProps } from 'formik';
import {
	useGetAllMonitorSizes,
	useGetAllMonitorTypes,
	useGetAllPcTypes,
} from '@api/pc-equipments';
import { useGetAllBrands } from '@api/brands';
import { useGetAllConditions } from '@api/conditions';
import { useGetAllDepartments } from '@api/departments';
import { TClassroom, useGetClassroomsBySearchTerm } from '@api/classrooms';
import { SearchAsyncSelect } from '@shared/components';
import { customOptionsReactSelect } from '@shared/utils';
import { TPcEquipmentFormValues } from '../schemas';

export interface PcEquipmentFormInputsProps {
	formik: FormikProps<TPcEquipmentFormValues>;
	disabled?: boolean;
	classroomDefaultOption?: {
		value: string;
		label: string;
		data?: TClassroom;
	} | null;
}

const inputClassName =
	'w-full h-10 px-3 bg-muted border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors disabled:text-muted-foreground';

interface TextFieldConfig {
	name: keyof Pick<
		TPcEquipmentFormValues,
		'inventoryNumber' | 'processor' | 'ram' | 'disk'
	>;
	label: string;
	placeholder: string;
}

const TEXT_FIELDS: TextFieldConfig[] = [
	{
		name: 'inventoryNumber',
		label: 'Número de inventario',
		placeholder: 'Ej. INV-001',
	},
	{
		name: 'processor',
		label: 'Procesador',
		placeholder: 'Ej. Intel Core i5',
	},
	{ name: 'ram', label: 'Memoria RAM', placeholder: 'Ej. 8GB' },
	{ name: 'disk', label: 'Disco', placeholder: 'Ej. SSD 256GB' },
];

interface SelectFieldProps {
	id: string;
	label: string;
	value: string;
	placeholder: string;
	options: { value: string; label: string }[];
	isLoading?: boolean;
	disabled?: boolean;
	error?: string;
	touched?: boolean;
	onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
	onBlur: (e: React.FocusEvent<HTMLSelectElement>) => void;
}

const SelectField = ({
	id,
	label,
	value,
	placeholder,
	options,
	isLoading = false,
	disabled = false,
	error,
	touched,
	onChange,
	onBlur,
}: SelectFieldProps) => (
	<div className="space-y-2">
		<label htmlFor={id} className="text-sm font-medium text-foreground">
			{label}
		</label>
		<select
			id={id}
			name={id}
			value={value}
			onChange={onChange}
			onBlur={onBlur}
			disabled={disabled || isLoading}
			className={`${inputClassName} cursor-pointer`}
		>
			<option value="">{isLoading ? 'Cargando...' : placeholder}</option>
			{options.map(option => (
				<option key={option.value} value={option.value}>
					{option.label}
				</option>
			))}
		</select>
		{touched && error ? (
			<p className="text-xs text-destructive">{error}</p>
		) : null}
	</div>
);

export const PcEquipmentFormInputs = ({
	formik,
	disabled = false,
	classroomDefaultOption = null,
}: PcEquipmentFormInputsProps) => {
	const brands = useGetAllBrands();
	const conditions = useGetAllConditions();
	const pcTypes = useGetAllPcTypes();
	const monitorTypes = useGetAllMonitorTypes();
	const monitorSizes = useGetAllMonitorSizes();
	const departments = useGetAllDepartments();

	const useClassroomsSearch = (
		searchTerm: string,
		page?: number,
		size?: number
	) => useGetClassroomsBySearchTerm(searchTerm, page, size);

	const handleClassroomInfo = (classroom: TClassroom) =>
		formik.setFieldValue('classroomId', classroom.id);

	const selectFields: SelectFieldProps[] = [
		{
			id: 'brandId',
			label: 'Marca',
			placeholder: 'Seleccione una marca',
			options:
				brands.data?.map(b => ({ value: b.id, label: b.name })) ?? [],
			isLoading: brands.isLoading,
		},
		{
			id: 'pcTypeId',
			label: 'Tipo de PC',
			placeholder: 'Seleccione un tipo',
			options:
				pcTypes.data?.map(t => ({
					value: t.id,
					label: t.description,
				})) ?? [],
			isLoading: pcTypes.isLoading,
		},
		{
			id: 'conditionId',
			label: 'Condición',
			placeholder: 'Seleccione una condición',
			options:
				conditions.data?.map(c => ({
					value: c.id,
					label: c.status,
				})) ?? [],
			isLoading: conditions.isLoading,
		},
		{
			id: 'monitorTypeId',
			label: 'Tipo de monitor',
			placeholder: 'Seleccione un tipo',
			options:
				monitorTypes.data?.map(t => ({
					value: t.id,
					label: t.description,
				})) ?? [],
			isLoading: monitorTypes.isLoading,
		},
		{
			id: 'monitorSizeId',
			label: 'Tamaño de monitor',
			placeholder: 'Seleccione un tamaño',
			options:
				monitorSizes.data?.map(s => ({
					value: s.id,
					label: s.description,
				})) ?? [],
			isLoading: monitorSizes.isLoading,
		},
		{
			id: 'departmentId',
			label: 'Departamento (opcional)',
			placeholder: 'Sin departamento asignado',
			options:
				departments.data?.map(d => ({
					value: d.id,
					label: d.name,
				})) ?? [],
			isLoading: departments.isLoading,
		},
	].map(field => ({
		...field,
		value:
			(formik.values[
				field.id as keyof TPcEquipmentFormValues
			] as string) ?? '',
		disabled,
		error: formik.errors[field.id as keyof TPcEquipmentFormValues],
		touched: formik.touched[field.id as keyof TPcEquipmentFormValues],
		onChange: formik.handleChange,
		onBlur: formik.handleBlur,
	}));

	return (
		<>
			{TEXT_FIELDS.map(field => (
				<div key={field.name} className="space-y-2">
					<label
						htmlFor={field.name}
						className="text-sm font-medium text-foreground"
					>
						{field.label}
					</label>
					<input
						id={field.name}
						type="text"
						name={field.name}
						value={formik.values[field.name] ?? ''}
						onChange={formik.handleChange}
						onBlur={formik.handleBlur}
						disabled={disabled}
						placeholder={field.placeholder}
						className={inputClassName}
					/>
					{formik.touched[field.name] && formik.errors[field.name] ? (
						<p className="text-xs text-destructive">
							{formik.errors[field.name]}
						</p>
					) : null}
				</div>
			))}

			{selectFields.map(field => (
				<SelectField key={field.id} {...field} />
			))}

			<div className="space-y-2">
				<label className="text-sm font-medium text-foreground">
					Aula (opcional)
				</label>
				<SearchAsyncSelect<TClassroom>
					hook={useClassroomsSearch}
					handleChange={handleClassroomInfo}
					getOptionValue={c => c.id}
					getOptionLabel={c => c.name}
					formatOptionLabel={(data, { context }) =>
						customOptionsReactSelect(
							data.label,
							data.data?.building?.name ?? '',
							context
						)
					}
					defaultOption={classroomDefaultOption}
				/>
			</div>
		</>
	);
};
