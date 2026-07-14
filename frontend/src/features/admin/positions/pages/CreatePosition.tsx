import { useCreatePosition } from '@api/positions';
import { useAbility } from '@config';
import { Button, Error, Loading } from '@shared/components';
import { errorsFormik } from '@shared/utils';
import { useFormik } from 'formik';
import { Navigate, useNavigate } from 'react-router-dom';
import {
	initialValuesPosition,
	positionCreateSchema,
	type TCreatePosition,
} from '../schemas';

export const CreatePosition = () => {
	const ability = useAbility();
	const navigate = useNavigate();
	const { mutateAsync: addPositionAsync, isPending } = useCreatePosition();

	const canCreate = ability.can('create', 'positions');

	const {
		values,
		handleChange,
		handleBlur,
		touched,
		errors,
		handleSubmit,
		resetForm,
	} = useFormik<TCreatePosition>({
		initialValues: initialValuesPosition,
		onSubmit: values => handleCreatePosition(values),
		validate: values => {
			const result = positionCreateSchema.safeParse(values);
			if (result.success) return;
			return errorsFormik<TCreatePosition>(result);
		},
	});

	if (!canCreate) {
		return <Navigate to="/admin/positions" replace />;
	}

	const handleCancel = () => {
		navigate(-1);
	};

	const handleCreatePosition = async (values: TCreatePosition) => {
		await addPositionAsync(values);
		resetForm({ values: initialValuesPosition });
		navigate(-1);
	};

	return (
		<>
			{isPending && <Loading />}
			<div className="p-10 rounded shadow-md w-full max-w-3xl h-fit bg-white m-auto">
				<span className="text-2xl font-bold">Nueva Posición</span>
				<form className="mt-6" onSubmit={handleSubmit}>
					<div className="mt-6">
						<label className="block mb-2 font-bold" htmlFor="name">
							Nombre
						</label>
						<input
							type="text"
							id="name"
							name="name"
							className="w-full bg-gray-100 shadow-md rounded-md px-2 py-2 outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
							placeholder="Ingrese el nombre de la posición"
							onChange={handleChange}
							onBlur={handleBlur}
							value={values.name}
						/>
						{touched.name && errors.name && <Error error={errors.name} />}
					</div>

					<div className="flex justify-center items-center gap-4 mt-8 flex-col sm:flex-row">
						<Button
							type="submit"
							className="bg-[#5BC85C] text-white p-2 hover:bg-green-300 transition duration-500"
						>
							Guardar cambios
						</Button>
						<Button
							type="button"
							onClick={handleCancel}
							className="bg-[#DC3545] text-white p-2 hover:bg-red-300 transition duration-500"
						>
							Cancelar
						</Button>
					</div>
				</form>
			</div>
		</>
	);
};
