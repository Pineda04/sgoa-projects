import type { FormikProps } from 'formik';
import { useGetAllBrands } from '@api/brands';
import { useGetAllConditions } from '@api/conditions';
import { useGetAllMonitorSizes, useGetAllMonitorTypes } from '@api/pc-equipments';
import { TClassroomSearch, useGetClassroomsBySearchTerm } from '@api/classrooms';
import { SearchAsyncSelect } from '@shared/components';
import { customOptionsReactSelect } from '@shared/utils';
import { TDigitalBlackboardFormValues } from '../schemas';

export interface DigitalBlackboardFormInputsProps {
	formik: FormikProps<TDigitalBlackboardFormValues>;
	disabled?: boolean;
	classroomDefaultOption?: {
		value: string;
		label: string;
		data?: TClassroomSearch;
	} | null;
}

const inputClassName =
	'w-full h-10 px-3 bg-muted border border-border rounded-lg text-sm outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors disabled:text-muted-foreground';

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

export const DigitalBlackboardFormInputs = ({
	formik,
	disabled = false,
	classroomDefaultOption = null,
}: DigitalBlackboardFormInputsProps) => {
	const brands = useGetAllBrands();
	const conditions = useGetAllConditions();
	const monitorTypes = useGetAllMonitorTypes();
	const monitorSizes = useGetAllMonitorSizes();

	const handleClassroomInfo = (classroom: TClassroomSearch) =>
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
			id: 'monitorTypeId',
			label: 'Tipo de Monitor',
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
			label: 'Tamaño de Monitor',
			placeholder: 'Seleccione un tamaño',
			options:
				monitorSizes.data?.map(s => ({
					value: s.id,
					label: s.description,
				})) ?? [],
			isLoading: monitorSizes.isLoading,
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
	].map(field => ({
		...field,
		value:
			(formik.values[
				field.id as keyof TDigitalBlackboardFormValues
			] as string) ?? '',
		disabled,
		error: formik.errors[field.id as keyof TDigitalBlackboardFormValues],
		touched: formik.touched[field.id as keyof TDigitalBlackboardFormValues],
		onChange: formik.handleChange,
		onBlur: formik.handleBlur,
	}));

	return (
		<>
			<div className="space-y-2 md:col-span-2">
				<label
					htmlFor="description"
					className="text-sm font-medium text-foreground"
				>
					Descripción (opcional)
				</label>
				<input
					id="description"
					type="text"
					name="description"
					value={formik.values.description ?? ''}
					onChange={formik.handleChange}
					onBlur={formik.handleBlur}
					disabled={disabled}
					placeholder="Ej. Pizarra digital interactiva de 65 pulgadas"
					className={inputClassName}
				/>
				{formik.touched.description && formik.errors.description ? (
					<p className="text-xs text-destructive">
						{formik.errors.description}
					</p>
				) : null}
			</div>

			{selectFields.map(field => (
				<SelectField key={field.id} {...field} />
			))}

			{/* Buscador de aulas */}
			<div className="space-y-2">
				<label className="text-sm font-medium text-foreground">
					Aula
				</label>
				<SearchAsyncSelect<TClassroomSearch>
					hook={useGetClassroomsBySearchTerm}
					handleChange={handleClassroomInfo}
					getOptionValue={c => c.id}
					getOptionLabel={c => c.name}
					formatOptionLabel={(data, { context }) =>
						customOptionsReactSelect(
							data.label,
							data.data?.building?.name ?? '',
							context,
						)
					}
					defaultOption={classroomDefaultOption}
				/>
				{formik.touched.classroomId && formik.errors.classroomId ? (
					<p className="text-xs text-destructive">
						{formik.errors.classroomId}
					</p>
				) : null}
			</div>
		</>
	);
};
