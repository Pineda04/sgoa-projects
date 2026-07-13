import { useFormik } from 'formik';
import { PencilIcon, Save, XCircle } from 'lucide-react';
import { IoWarningOutline } from 'react-icons/io5';
import { askDel } from '@shared/utils/delete-action';
import Select, {
	ActionMeta,
	GroupBase,
	MultiValue,
	SingleValue,
	StylesConfig,
} from 'react-select';
import {
	TUpdateUser,
	useChangeStatusActiveStatus,
	useUpdateUser,
} from '@api/users';
import { TAcademicCommonProps } from '@api/periods';
import {
	TOutputTeacherPosition,
	useGetAllTeacherCategories,
} from '@api/teachers';
import { useAbility } from '@config';
import { useAuth } from '@config/providers';
import {
	useGetAllPostgrads,
	useGetAllUndergrads,
	useManageTeacherDegrees,
} from '@api/degrees';
import { useGetAllContractTypes } from '@api/contract-types';
import { useGetAllShifts } from '@api/shifts';
import { useMemo, useState } from 'react';
import { userUpdateSchema } from '../schemas';
import { errorsFormik } from '@shared/utils';
import { Button, Error, Loading } from '@shared/components';

const customStyles: StylesConfig<
	TCustomSelectOption,
	boolean,
	GroupBase<TCustomSelectOption>
> = {
	control: base => ({
		...base,
		borderRadius: '6px',
		borderColor: '#99a1af',
		cursor: 'pointer',
		padding: '2px',
	}),
	option: base => ({
		...base,
		cursor: 'pointer',
	}),
};

const FIELD_TYPE_TAG = {
	TEXT: 'text',
	NUMBER: 'number',
	SELECT: 'select',
	CUSTOM_SELECT: 'custom-select',
	TIME_SELECT: 'time',
	CUSTOM: 'custom',
	CHECKBOX: 'checkbox',
} as const;

type TUpdateUserExtended = TUpdateUser & { workingDay: string };

type TBaseField<
	K extends keyof TUpdateUserExtended = keyof TUpdateUserExtended,
> = {
	label: string;
	name: K;
	readOnly?: boolean;
	handleBlur: {
		(e: React.FocusEvent<unknown, Element>): void;
		<T = unknown>(
			fieldOrEvent: T
		): T extends string ? (e: unknown) => void : void;
	};
};

type TTextField = TBaseField & {
	type: typeof FIELD_TYPE_TAG.TEXT | typeof FIELD_TYPE_TAG.TIME_SELECT;
	value: string;
	handleChange: (event: React.ChangeEvent<unknown> | string) => void;
	placeholder?: string;
};

type TCustomSelectOption = { label: string; value: string };

type TCustomSelectField = TBaseField & {
	type: typeof FIELD_TYPE_TAG.CUSTOM_SELECT;
	options: TCustomSelectOption[];
	defaultValue?: TCustomSelectOption | TCustomSelectOption[];
	handleChange: (
		newValue:
			| SingleValue<TCustomSelectOption>
			| MultiValue<TCustomSelectOption>,
		actionMeta: ActionMeta<TCustomSelectOption>
	) => void;
	isMulti?: boolean;
	placeholder?: string;
};

type TCustomField = Pick<TBaseField, 'name' | 'label'> & {
	type: typeof FIELD_TYPE_TAG.CUSTOM;
	element: React.ReactNode;
};

type TFieldConfig = TTextField | TCustomSelectField | TCustomField;

const genElement = (field: Omit<TFieldConfig, 'label'> & {}) => {
	switch (field.type) {
		case FIELD_TYPE_TAG.TIME_SELECT:
		case FIELD_TYPE_TAG.TEXT: {
			const { name, value, readOnly, handleChange, handleBlur } =
				field as TTextField;

			return (
				<input
					name={name}
					type={field.type}
					value={value as string}
					className="w-full mb-2 border rounded-md p-2 border-gray-400 read-only:bg-gray-100"
					readOnly={readOnly}
					onChange={handleChange}
					onBlur={handleBlur}
				/>
			);
		}

		case FIELD_TYPE_TAG.CUSTOM_SELECT: {
			const {
				name,
				defaultValue,
				options,
				handleChange,
				handleBlur,
				readOnly,
				isMulti,
			} = field as TCustomSelectField;

			return (
				<Select
					name={name}
					isMulti={isMulti}
					value={defaultValue}
					options={options}
					isSearchable={true}
					placeholder="Seleccione..."
					onChange={handleChange}
					isDisabled={readOnly}
					onBlur={handleBlur}
					styles={customStyles}
				/>
			);
		}

		case FIELD_TYPE_TAG.CUSTOM:
			return <>{(field as TCustomField).element}</>;

		default:
			break;
	}
};

const selectedValueSelect = <T extends TAcademicCommonProps>(
	array?: Array<T>,
	id?: string
) => {
	if (!array || !id) return;

	const element = array.find(cat => cat.id === id);

	if (!element) return;

	return {
		label: element.name,
		value: element.id,
	};
};

interface IProps {
	initialData: TOutputTeacherPosition;
	isModal?: boolean;
}

export const UserView = ({ initialData, isModal }: IProps) => {
	const {
		authState: { user },
	} = useAuth();
	const ability = useAbility();
	const canUpdate = ability.can('update', 'users');

	const { updateUser, isPendingUpdate } = useUpdateUser(initialData.userId);
	const { changeStatusActiveUser, isPendingChangeStatusActive } =
		useChangeStatusActiveStatus();

	// Undergrads
	const {
		executeAction: addUserTeacherUndergrad,
		isPending: isPendingAddTeacherUndergrad,
	} = useManageTeacherDegrees(initialData.userId, 'undergrad', 'add');
	const {
		executeAction: deleteUserTeacherUndergrad,
		isPending: isPendingDeleteTeacherUndergrad,
	} = useManageTeacherDegrees(initialData.userId, 'undergrad', 'delete');

	// Postgrads
	const {
		executeAction: addUserTeacherPostgrad,
		isPending: isPendingAddTeacherPostgrad,
	} = useManageTeacherDegrees(initialData.userId, 'postgrad', 'add');
	const {
		executeAction: deleteUserTeacherPostgrad,
		isPending: isPendingDeleteTeacherPostgrad,
	} = useManageTeacherDegrees(initialData.userId, 'postgrad', 'delete');

	const undergrads = useGetAllUndergrads();
	const postgrads = useGetAllPostgrads();
	const contractTypes = useGetAllContractTypes();
	const categories = useGetAllTeacherCategories();
	const shifts = useGetAllShifts();

	const isLoading = [
		undergrads,
		postgrads,
		contractTypes,
		categories,
		shifts,
	].some(q => q.isLoading);

	const [isEdit, setIsEdit] = useState(false);

	const initialValues = useMemo(
		() =>
			({
				name: initialData.name,
				code: initialData.code,
				email: initialData.email,
				categoryId: initialData.categoryId,
				contractTypeId: initialData.contractTypeId,
				shiftId: initialData.shiftId,
				shiftStart: initialData.shiftStart,
				shiftEnd: initialData.shiftEnd,
			}) as TUpdateUser,
		[initialData]
	);

	const formik = useFormik<TUpdateUser>({
		initialValues,
		onSubmit: values => onSubmitting(values),
		validateOnChange: true,
		validate: values => {
			const result = userUpdateSchema.safeParse(values);

			if (result.success) return;

			return errorsFormik<TUpdateUser>(result);
		},
	});

	const isFormikField = (name: string): name is keyof TUpdateUser =>
		Object.prototype.hasOwnProperty.call(formik.values, name);

	const fields = useMemo<TFieldConfig[]>(
		() => [
			{
				label: 'Nombre',
				name: 'name',
				type: FIELD_TYPE_TAG.TEXT,
				value: String(formik.values.name),
				placeholder: 'Nombre completo',
				handleBlur: formik.handleBlur,
				handleChange: formik.handleChange,
				readOnly: !isEdit,
			},
			{
				label: 'Código docente',
				name: 'code',
				type: FIELD_TYPE_TAG.TEXT,
				value: String(formik.values.code),
				placeholder: '12345',
				handleBlur: formik.handleBlur,
				handleChange: formik.handleChange,
				readOnly: !isEdit,
			},
			{
				label: 'Correo',
				name: 'email',
				type: FIELD_TYPE_TAG.TEXT,
				value: String(formik.values.email),
				placeholder: 'example@unah.edu.hn',
				handleBlur: formik.handleBlur,
				handleChange: formik.handleChange,
				readOnly: !isEdit,
			},
			{
				label: 'Categoría',
				name: 'categoryId',
				type: FIELD_TYPE_TAG.CUSTOM_SELECT,
				defaultValue: selectedValueSelect(
					categories.data,
					formik.values.categoryId
				),
				options: categories.data
					? categories.data.map(cat => ({
							label: cat.name,
							value: cat.id,
						}))
					: [],
				isMulti: false,
				handleBlur: formik.handleBlur,
				handleChange: newValue => {
					formik.setFieldValue(
						'categoryId',
						(newValue as SingleValue<TCustomSelectOption>)?.value
					);
				},
				readOnly: !isEdit,
			},
			{
				label: 'Tipo de Contratación',
				name: 'contractTypeId',
				type: FIELD_TYPE_TAG.CUSTOM_SELECT,
				defaultValue: selectedValueSelect(
					contractTypes.data,
					formik.values.contractTypeId
				),
				options: contractTypes.data
					? contractTypes.data.map(cat => ({
							label: cat.name,
							value: cat.id,
						}))
					: [],
				isMulti: false,
				handleBlur: formik.handleBlur,
				handleChange: newValue => {
					formik.setFieldValue(
						'contractTypeId',
						(newValue as SingleValue<TCustomSelectOption>)?.value
					);
				},
				readOnly: !isEdit,
			},
			{
				label: 'Jornada',
				name: 'shiftId',
				type: FIELD_TYPE_TAG.CUSTOM_SELECT,
				defaultValue: selectedValueSelect(
					shifts.data,
					formik.values.shiftId
				),
				options: shifts.data
					? shifts.data.map(cat => ({
							label: cat.name,
							value: cat.id,
						}))
					: [],
				isMulti: false,
				handleBlur: formik.handleBlur,
				handleChange: newValue => {
					formik.setFieldValue(
						'shiftId',
						(newValue as SingleValue<TCustomSelectOption>)?.value
					);
				},
				readOnly: !isEdit,
			},
			{
				label: 'Jornada laboral',
				name: 'workingDay',
				type: FIELD_TYPE_TAG.CUSTOM,
				element: (
					<div key={'workingDay'} className="grid grid-cols-2 gap-2">
						{(
							[
								{
									label: 'Hora de inicio',
									name: 'shiftStart',
									type: FIELD_TYPE_TAG.TIME_SELECT,
									value: String(
										formik.values.shiftStart ?? ''
									),
									placeholder: '15:00',
									handleBlur: formik.handleBlur,
									handleChange: formik.handleChange,
									readOnly: !isEdit,
								},
								{
									label: 'Hora final',
									name: 'shiftEnd',
									type: FIELD_TYPE_TAG.TIME_SELECT,
									value: String(formik.values.shiftEnd ?? ''),
									placeholder: '20:00',
									handleBlur: formik.handleBlur,
									handleChange: formik.handleChange,
									readOnly: !isEdit,
								},
							] as TFieldConfig[]
						).map(field => (
							<div
								key={field.name}
								className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-2"
							>
								<label className="mb-2 sm:whitespace-break-spaces lg:whitespace-nowrap">
									{field.label}
								</label>
								{genElement(field)}
							</div>
						))}
					</div>
				),
			},
			{
				label: 'Pregados',
				name: 'undergradId',
				type: FIELD_TYPE_TAG.CUSTOM_SELECT,
				defaultValue: initialData.undergrads.map(u => ({
					label: u.name,
					value: u.id,
				})),
				options: undergrads.data
					? undergrads.data.map(u => ({
							label: u.name,
							value: u.id,
						}))
					: [],
				isMulti: true,
				handleBlur: formik.handleBlur,
				handleChange: async (_newValue, actionMeta) => {
					if (actionMeta.action === 'select-option')
						await addUserTeacherUndergrad({
							body: {
								userId: initialData.userId,
								undergradId: actionMeta.option?.value,
							},
						});

					if (actionMeta.action === 'remove-value')
						await deleteUserTeacherUndergrad({
							body: {
								userId: initialData.userId,
								undergradId: actionMeta.removedValue?.value,
							},
						});

					handleEdit();
				},
				readOnly: !isEdit,
			},
			{
				label: 'Postgrados',
				name: 'postgradId',
				type: FIELD_TYPE_TAG.CUSTOM_SELECT,
				defaultValue: initialData.postgrads.map(u => ({
					label: u.name,
					value: u.id,
				})),
				options: postgrads.data
					? postgrads.data.map(u => ({
							label: u.name,
							value: u.id,
						}))
					: [],
				isMulti: true,
				handleBlur: formik.handleBlur,
				handleChange: async (_newValue, actionMeta) => {
					if (actionMeta.action === 'select-option')
						await addUserTeacherPostgrad({
							body: {
								userId: initialData.userId,
								postgradId: actionMeta.option?.value,
							},
						});

					if (actionMeta.action === 'remove-value')
						await deleteUserTeacherPostgrad({
							body: {
								userId: initialData.userId,
								postgradId: actionMeta.removedValue?.value,
							},
						});

					handleEdit();
				},
				readOnly: !isEdit,
			},
		],
		[
			initialData,
			categories.data,
			contractTypes.data,
			shifts.data,
			undergrads.data,
			postgrads.data,
			formik,
			isEdit,
			addUserTeacherUndergrad,
			deleteUserTeacherUndergrad,
			addUserTeacherPostgrad,
			deleteUserTeacherPostgrad,
		]
	);

	const handleEdit = () => setIsEdit(prev => !prev);

	const handleDeactivateUser = async () =>
		askDel(
			initialData.id,
			`${initialData.activeStatus ? 'desactivar' : 'activar'} el usuario <${initialData.name}>`,
			changeStatusActiveUser
		);

	const onSubmitting = async (values: TUpdateUser) => {
		await updateUser({ body: values });

		handleEdit();
	};

	if (
		isLoading ||
		isPendingUpdate ||
		isPendingAddTeacherUndergrad ||
		isPendingDeleteTeacherUndergrad ||
		isPendingAddTeacherPostgrad ||
		isPendingDeleteTeacherPostgrad ||
		isPendingChangeStatusActive
	)
		return <Loading />;

	return (
		<div className={`${!isModal ? 'min-h-screen ' : ''}px-4 py-4`}>
			<div
				className={`sticky z-20 mb-5 ${isModal ? 'bg-white' : 'bg-gray-50 top-14.25'}`}
			>
				<div className="flex flex-col justify-start items-center py-5 md:flex-row md:justify-between md:items-center md:py-0 w-full">
					<h1 className="text-2xl font-semibold">
						Perfil de usuario
					</h1>
					<div className="mt-2 lg:mt-0 flex">
						<Button
							type="button"
							className="w-fit bg-[#DC3545] flex flex-row mx-auto items-center rounded-md text-white p-2 gap-2 mr-2 hover:bg-red-400 transition duration-500 cursor-pointer"
							hidden={
								initialData.userId === user?.sub ||
								!ability.can('manage', 'user-status') ||
								isEdit
							}
							onClick={handleDeactivateUser}
							variant="unstyled"
						>
							<IoWarningOutline className="size-5" />
							{initialData.activeStatus
								? 'Desactivar'
								: 'Activar'}
						</Button>
						<Button
							type="button"
							className="w-fit bg-[#144C74] flex flex-row mx-auto items-center rounded-md text-white p-2 gap-2 hover:bg-blue-300 transition duration-500 cursor-pointer"
							hidden={isEdit || !canUpdate}
							onClick={handleEdit}
							variant="unstyled"
						>
							<PencilIcon className="size-5" />
							Editar
						</Button>
						<Button
							type="button"
							className="w-fit bg-[#5BC85C] flex flex-row mx-auto items-center rounded-md text-white p-2 gap-2 ml-2 hover:bg-green-300 transition duration-500 cursor-pointer"
							hidden={!isEdit}
							onClick={() => formik.handleSubmit()}
							variant="unstyled"
						>
							<Save className="size-5" />
							Guardar
						</Button>
						<Button
							type="button"
							className="w-fit bg-[#DC3545] flex flex-row mx-auto items-center rounded-md text-white p-2 gap-2 ml-2 hover:bg-red-400 transition duration-500 cursor-pointer"
							hidden={!isEdit}
							onClick={() => {
								handleEdit();
								formik.resetForm({
									values: initialValues,
								});
							}}
							variant="unstyled"
						>
							<XCircle className="size-5" />
							Cancelar
						</Button>
					</div>
				</div>
				<hr className="h-px my-2 bg-gray-200 border-0" />
			</div>
			<div
				className={`grid grid-cols-1 md:grid-cols-2 gap-4${isModal ? ' h-[50vh] overflow-auto' : ''}`}
			>
				{fields.map(field => {
					const base = (content?: React.ReactNode) => (
						<div key={field.name}>
							<label className="block mb-2 font-bold">
								{field.label}
							</label>
							{genElement(field)}
							{content}
						</div>
					);

					if (!isFormikField(String(field.name))) return base();

					const key = field.name as keyof TUpdateUser;

					return base(
						<>
							{formik.touched[key] && formik.errors[key] && (
								<Error error={formik.errors[key]!} />
							)}
						</>
					);
				})}
			</div>
		</div>
	);
};
