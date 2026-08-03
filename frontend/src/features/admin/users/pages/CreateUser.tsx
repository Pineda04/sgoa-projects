import { useGetAllContractTypes } from '@api/contract-types';
import { useGetAllPostgrads, useGetAllUndergrads } from '@api/degrees';
import { useGetAllShifts } from '@api/shifts';
import { useGetAllTeacherCategories } from '@api/teachers';
import { TCreateUser, useCreateUser } from '@api/users';
import { useAbility } from '@config';
import { useFormik } from 'formik';
import { useNavigate } from 'react-router-dom';
import { initialValuesUser, userCreateSchema } from '../schemas';
import { errorsFormik, setOptions } from '@shared/utils';
import { Button, Error, Loading } from '@shared/components';
import { TAcademicCommonProps } from '@api/periods';
import { SelectAccessRoles, SelectCenterDepartments } from '../components';
import { FiSave } from 'react-icons/fi';

export const CreateUser = () => {
	const ability = useAbility();
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

	const { mutateAsync: addUserAsync } = useCreateUser();
	const navigate = useNavigate();

	const canManageRoles = ability.can('manage', 'user-roles');
	const canManageDepartments = ability.can('manage', 'user-departments');

	const {
		values,
		setValues,
		handleChange,
		handleBlur,
		touched,
		errors,
		handleSubmit,
		resetForm,
	} = useFormik<TCreateUser>({
		initialValues: {
			...initialValuesUser,
			roles: [],
			extraFieldsEnabled: canManageRoles,
		},
		onSubmit: values => handleCreateUser(values),
		validate: values => {
			const result = userCreateSchema.safeParse(values);
			if (result.success) return;
			return errorsFormik<TCreateUser>(result);
		},
	});

	const handleCancel = () => {
		navigate(-1);
		// console.log('hokas');
	};

	const handleCreateUser = async (values: TCreateUser) => {
		await addUserAsync({
			...values,
			postgradId:
				values.postgradId === '' ? undefined : values.postgradId,
			positionId:
				values.positionId === '' ? undefined : values.positionId,
		});

		resetForm({
			values: {
				...initialValuesUser,
				roles: [],
				extraFieldsEnabled: canManageRoles,
			},
		});

		navigate(-1);
	};

	return (
		<>
			{isLoading && <Loading />}
			<div className="p-10 rounded shadow-md w-full max-w-4xl h-fit bg-white m-auto">
				<span className="text-2xl font-bold bg-red-">
					Nuevo Usuario
				</span>
				<form
					className="grid grid-cols-1 md:grid-cols-2 gap-x-0 md:gap-x-10"
					onSubmit={handleSubmit}
				>
					<div className="mt-6">
						<label className="block mb-2 font-bold" htmlFor="email">
							Correo
						</label>
						<input
							type="text"
							id="email"
							name="email"
							className="w-full bg-gray-100 shadow-md rounded-md px-2 py-2 outline-none"
							placeholder="Ingrese el correo"
							onBlur={handleBlur}
							onChange={handleChange}
							value={values.email}
						/>
						{touched.email && errors.email && (
							<Error error={errors.email} />
						)}
					</div>

					<div className="mt-6">
						<label className="block mb-2 font-bold" htmlFor="code">
							Código
						</label>
						<input
							type="text"
							id="code"
							name="code"
							className="w-full bg-gray-100 shadow-md rounded-md px-2 py-2 outline-none"
							placeholder="Ingrese el código"
							onChange={handleChange}
							onBlur={handleBlur}
							value={values.code}
						/>
						{touched.code && errors.code && (
							<Error error={errors.code} />
						)}
					</div>

					<div className="mt-6">
						<label className="block mb-2 font-bold" htmlFor="name">
							Nombre
						</label>
						<input
							type="text"
							id="name"
							name="name"
							className="w-full bg-gray-100 shadow-md rounded-md px-2 py-2 outline-none"
							placeholder="Ingrese el nombre completo"
							onChange={handleChange}
							onBlur={handleBlur}
							value={values.name}
						/>
						{touched.name && errors.name && (
							<Error error={errors.name} />
						)}
					</div>

					<div className="mt-6">
						<label
							className="block mb-2 font-bold"
							htmlFor="undergrad"
						>
							Pregrado
						</label>
						<select
							id="undergrad"
							name="undergradId"
							className="w-full bg-gray-100 shadow-md rounded-md px-2 py-2 outline-none"
							onChange={e => {
								const undergradId =
									e.target.options[e.target.selectedIndex].id;
								setValues({ ...values, undergradId });
							}}
							onBlur={handleBlur}
							defaultValue={'select'}
						>
							<option value="select" disabled>
								Seleccione
							</option>
							{undergrads.data &&
								setOptions<TAcademicCommonProps>(
									(undergrads.data && undergrads.data) ?? []
								)}
						</select>
						{touched.undergradId && errors.undergradId && (
							<Error error={errors.undergradId} />
						)}
					</div>

					<div className="mt-6">
						<label
							className="block mb-2 font-bold"
							htmlFor="postgrad"
						>
							Postgrado
						</label>
						<select
							id="postgrad"
							name="postgradId"
							className="w-full bg-gray-100 shadow-md rounded-md px-2 py-2 outline-none"
							onChange={e => {
								const postgradId =
									e.target.options[e.target.selectedIndex].id;
								setValues({ ...values, postgradId });
							}}
							onBlur={handleBlur}
							defaultValue={''}
						>
							<option value="select" disabled>
								Seleccione
							</option>
							{postgrads.data &&
								setOptions<TAcademicCommonProps>(
									(postgrads.data && postgrads.data) ?? []
								)}
						</select>
						{touched.postgradId && errors.postgradId && (
							<Error error={errors.postgradId} />
						)}
					</div>

					<div className="mt-6">
						<label
							className="block mb-2 font-bold"
							htmlFor="category"
						>
							Categoría
						</label>
						<select
							id="category"
							name="categoryId"
							className="w-full bg-gray-100 shadow-md rounded-md px-2 py-2 outline-none"
							onChange={e => {
								const categoryId =
									e.target.options[e.target.selectedIndex].id;
								setValues({ ...values, categoryId });
							}}
							onBlur={handleBlur}
							defaultValue={'select'}
						>
							<option value="select" disabled>
								Seleccione
							</option>
							{categories.data &&
								setOptions<TAcademicCommonProps>(
									(categories.data && categories.data) ?? []
								)}
						</select>
						{touched.categoryId && errors.categoryId && (
							<Error error={errors.categoryId} />
						)}
					</div>

					<div className="mt-6">
						<label
							className="block mb-2 font-bold"
							htmlFor="contractType"
						>
							Tipo de Contratación
						</label>
						<select
							id="contractType"
							name="contractTypeId"
							className="w-full bg-gray-100 shadow-md rounded-md px-2 py-2 outline-none"
							onChange={e => {
								const contractTypeId =
									e.target.options[e.target.selectedIndex].id;
								setValues({
									...values,
									contractTypeId,
								});
							}}
							onBlur={handleBlur}
							defaultValue={'select'}
						>
							<option value="select" disabled>
								Seleccione
							</option>
							{contractTypes.data &&
								setOptions<TAcademicCommonProps>(
									(contractTypes.data &&
										contractTypes.data) ??
										[]
								)}
						</select>
						{touched.contractTypeId && errors.contractTypeId && (
							<Error error={errors.contractTypeId} />
						)}
					</div>

					<div className="mt-6">
						<label className="block mb-2 font-bold" htmlFor="shift">
							Jornada
						</label>
						<select
							id="shift"
							name="shiftId"
							className="w-full bg-gray-100 shadow-md rounded-md px-2 py-2 outline-none"
							onChange={e => {
								const shiftId =
									e.target.options[e.target.selectedIndex].id;
								setValues({ ...values, shiftId });
							}}
							onBlur={handleBlur}
							defaultValue={'select'}
						>
							<option value="select" disabled>
								Seleccione
							</option>
							{shifts.data &&
								setOptions<TAcademicCommonProps>(
									(shifts.data && shifts.data) ?? []
								)}
						</select>
						{touched.shiftId && errors.shiftId && (
							<Error error={errors.shiftId} />
						)}
					</div>

					{canManageRoles && (
						<SelectAccessRoles
							touched={touched}
							values={values}
							setValues={setValues}
							errors={errors}
							handleBlur={handleBlur}
						/>
					)}

					{canManageDepartments && !canManageRoles && (
						<SelectCenterDepartments
							touched={touched}
							values={values}
							setValues={setValues}
							errors={errors}
							handleBlur={handleBlur}
						/>
					)}

					<div className="col-span-1 md:col-span-2 flex justify-end items-center gap-4 mt-6 flex-col sm:flex-row">
						<Button
							type="button"
							variant="outline"
							onClick={handleCancel}
						>
							Cancelar
						</Button>
						<Button
							type="submit"
							className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
            >
              <FiSave className="size-4" />
              <span>
                Guardar Usuario
              </span>
						</Button>
					</div>
				</form>
			</div>
		</>
	);
};
