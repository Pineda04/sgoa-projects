import type { FormikProps } from 'formik';
import { useGetAllBuildings } from '@api/buildings';
import { useGetAllDepartments } from '@api/departments';
import { useGetAllRoomTypes } from '@api/room-types';
import { useGetAllConnectivities } from '@api/connectivities';
import { useGetAllAudioEquipments } from '@api/audio-equipments';
import { useGetAllConditions } from '@api/conditions';
import { TClassroomFormValues } from '../schemas';

export interface ClassroomFormInputsProps {
	formik: FormikProps<TClassroomFormValues>;
	disabled?: boolean;
}

const inputClassName =
	'w-full h-10 px-3 bg-muted border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors disabled:text-muted-foreground';

interface NumberFieldConfig {
	name: keyof Pick<
		TClassroomFormValues,
		| 'desks'
		| 'tables'
		| 'projectors'
		| 'powerOutlets'
		| 'lights'
		| 'blackboards'
		| 'lecterns'
		| 'windows'
		| 'maxCapacity'
	>;
	label: string;
	placeholder: string;
}

const NUMBER_FIELDS: NumberFieldConfig[] = [
	{ name: 'desks', label: 'Escritorios', placeholder: 'Ej. 20' },
	{ name: 'tables', label: 'Mesas', placeholder: 'Ej. 10' },
	{ name: 'projectors', label: 'Proyectores', placeholder: 'Ej. 1' },
	{ name: 'powerOutlets', label: 'Tomacorrientes', placeholder: 'Ej. 8' },
	{ name: 'lights', label: 'Luces', placeholder: 'Ej. 6' },
	{ name: 'blackboards', label: 'Pizarras', placeholder: 'Ej. 1' },
	{ name: 'lecterns', label: 'Atriles', placeholder: 'Ej. 1' },
	{ name: 'windows', label: 'Ventanas', placeholder: 'Ej. 4' },
	{
		name: 'maxCapacity',
		label: 'Capacidad máxima (opcional)',
		placeholder: 'Ej. 40',
	},
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

interface MultiSelectFieldProps {
	label: string;
	options: { value: string; label: string }[];
	selectedValues: string[];
	isLoading?: boolean;
	disabled?: boolean;
	error?: string;
	touched?: boolean;
	onToggle: (value: string) => void;
}

const MultiSelectField = ({
	label,
	options,
	selectedValues,
	isLoading = false,
	disabled = false,
	error,
	touched,
	onToggle,
}: MultiSelectFieldProps) => (
	<div className="space-y-2 md:col-span-2">
		<label className="text-sm font-medium text-foreground">{label}</label>
		<div className="border border-border rounded-lg p-3 max-h-48 overflow-y-auto space-y-2 bg-muted">
			{isLoading ? (
				<p className="text-sm text-muted-foreground">Cargando...</p>
			) : options.length === 0 ? (
				<p className="text-sm text-muted-foreground">
					No hay departamentos disponibles
				</p>
			) : (
				options.map(option => (
					<label
						key={option.value}
						className="flex items-center gap-2 text-sm cursor-pointer"
					>
						<input
							type="checkbox"
							checked={selectedValues.includes(option.value)}
							onChange={() => onToggle(option.value)}
							disabled={disabled}
							className="size-4 cursor-pointer accent-green-600"
						/>
						{option.label}
					</label>
				))
			)}
		</div>
		{touched && error ? (
			<p className="text-xs text-destructive">{error}</p>
		) : null}
	</div>
);

export const ClassroomFormInputs = ({
	formik,
	disabled = false,
}: ClassroomFormInputsProps) => {
	const buildings = useGetAllBuildings();
	const roomTypes = useGetAllRoomTypes();
	const connectivities = useGetAllConnectivities();
	const audioEquipments = useGetAllAudioEquipments();
	const conditions = useGetAllConditions();
	const departments = useGetAllDepartments();

	const selectFields: SelectFieldProps[] = [
		{
			id: 'buildingId',
			label: 'Edificio',
			placeholder: 'Seleccione un edificio',
			options:
				buildings.data?.map(b => ({ value: b.id, label: b.name })) ??
				[],
			isLoading: buildings.isLoading,
		},
		{
			id: 'roomTypeId',
			label: 'Tipo de aula',
			placeholder: 'Seleccione un tipo',
			options:
				roomTypes.data?.map(t => ({
					value: t.id,
					label: t.description,
				})) ?? [],
			isLoading: roomTypes.isLoading,
		},
		{
			id: 'connectivityId',
			label: 'Conectividad (opcional)',
			placeholder: 'Sin conectividad asignada',
			options:
				connectivities.data?.map(c => ({
					value: c.id,
					label: c.description,
				})) ?? [],
			isLoading: connectivities.isLoading,
		},
		{
			id: 'audioEquipmentId',
			label: 'Equipo de audio (opcional)',
			placeholder: 'Sin equipo de audio asignado',
			options:
				audioEquipments.data?.map(a => ({
					value: a.id,
					label: a.description,
				})) ?? [],
			isLoading: audioEquipments.isLoading,
		},
		{
			id: 'conditionId',
			label: 'Condición (opcional)',
			placeholder: 'Sin condición asignada',
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
			(formik.values[field.id as keyof TClassroomFormValues] as string) ??
			'',
		disabled,
		error: formik.errors[field.id as keyof TClassroomFormValues],
		touched: Boolean(
			formik.touched[field.id as keyof TClassroomFormValues]
		),
		onChange: formik.handleChange,
		onBlur: formik.handleBlur,
	}));

	const departmentOptions =
		departments.data?.map(d => ({ value: d.id, label: d.name })) ?? [];

	const selectedDepartmentIds = formik.values.departmentIds ?? [];

	const handleToggleDepartment = (departmentId: string) => {
		const current = formik.values.departmentIds ?? [];
		const next = current.includes(departmentId)
			? current.filter(id => id !== departmentId)
			: [...current, departmentId];
		formik.setFieldValue('departmentIds', next);
	};

	return (
		<>
			<div className="space-y-2 md:col-span-2">
				<label
					htmlFor="name"
					className="text-sm font-medium text-foreground"
				>
					Nombre del aula
				</label>
				<input
					id="name"
					type="text"
					name="name"
					value={formik.values.name}
					onChange={formik.handleChange}
					onBlur={formik.handleBlur}
					disabled={disabled}
					placeholder="Ej. Aula 101"
					className={inputClassName}
				/>
				{formik.touched.name && formik.errors.name ? (
					<p className="text-xs text-destructive">
						{formik.errors.name}
					</p>
				) : null}
			</div>

			{NUMBER_FIELDS.map(field => (
				<div key={field.name} className="space-y-2">
					<label
						htmlFor={field.name}
						className="text-sm font-medium text-foreground"
					>
						{field.label}
					</label>
					<input
						id={field.name}
						type="number"
						name={field.name}
						min={0}
						step={1}
						value={formik.values[field.name]}
						onChange={e =>
							formik.setFieldValue(field.name, e.target.value)
						}
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

			<MultiSelectField
				label="Departamentos (opcional)"
				options={departmentOptions}
				selectedValues={selectedDepartmentIds}
				isLoading={departments.isLoading}
				disabled={disabled}
				error={
					typeof formik.errors.departmentIds === 'string'
						? formik.errors.departmentIds
						: undefined
				}
				touched={Boolean(formik.touched.departmentIds)}
				onToggle={handleToggleDepartment}
			/>

			<div className="flex items-center gap-2 md:col-span-2">
				<input
					id="activeStatus"
					type="checkbox"
					name="activeStatus"
					checked={formik.values.activeStatus}
					onChange={formik.handleChange}
					disabled={disabled}
					className="size-4 cursor-pointer accent-green-600"
				/>
				<label
					htmlFor="activeStatus"
					className="text-sm font-medium text-foreground cursor-pointer"
				>
					Aula activa
				</label>
			</div>
		</>
	);
};
