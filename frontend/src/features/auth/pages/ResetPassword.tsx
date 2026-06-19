import { Button } from '@components/ui/button';
import { errorsFormik } from '@utils';
import { useFormik } from 'formik';
import { EyeIcon, EyeOff } from 'lucide-react';
import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useResetPassword } from '../hooks';
import { TResetPassword, resetPasswordSchema } from '../schemas';
import { Error } from '@components';
import { useShowPassword } from '@hooks';

// src/pages/Auth/RecuperarContraseña.tsx
export const ResetPassword = () => {
	const { showPassword, handleShowPassword } = useShowPassword({
		password: false,
		passwordConfirm: false,
	});

	const [params] = useSearchParams();
	const navigate = useNavigate();
	const { mutateAsync, isError } = useResetPassword();

	const token = params.get('token');

	useEffect(() => {
		//   if (!params.get("token")) navigate(`auth/login`);
		if (!token) navigate(`auth/login`);
	}, [params]);

	const {
		values,
		setValues,
		errors,
		handleSubmit,
		handleChange,
		handleBlur,
		touched,
	} = useFormik<TResetPassword>({
		initialValues: {
			password: '',
			passwordConfirm: '',
		},
		onSubmit: values => onSubmitting(values),
		validate: values => {
			const result = resetPasswordSchema.safeParse(values);

			if (result.success) return;

			return errorsFormik<TResetPassword>(result);
		},
	});

	const onSubmitting = async (values: TResetPassword) => {
		if (!token) return navigate(`auth/login`);

		await mutateAsync({
			...values,
			token,
		});

		navigate(`auth/login`);

		setValues({
			password: '',
			passwordConfirm: '',
		});
	};

	if (isError) navigate(`auth/login`);

	return (
		<div className="flex h-screen">
			<div className="w-1/2 flex items-center justify-center">
				<img
					src="/src/assets/logo-unah-1.webp"
					alt="Logo UNAH"
					className="p-7 mb-16 object-cover"
				/>
			</div>
			<form
				onSubmit={handleSubmit}
				className="w-1/2 bg-[#144C74] flex flex-col items-center justify-center text-white"
			>
				{/* <h1 className="text-2xl font-bold mb-4">Recuperación de contraseña</h1> */}
				{/* <input */}
				{/*   className="w-sm bg-white mb-2 p-2 rounded-md text-black" */}
				{/*   placeholder="Código de verificación" */}
				{/*   type="text" */}
				{/* /> */}
				<div className="relative w-full max-w-md text-black mb-2">
					<input
						id="password"
						name="password"
						className="w-full bg-white p-2 rounded-md border border-gray-700"
						placeholder="Nueva contraseña"
						type={showPassword.password ? 'text' : 'password'}
						value={values.password ?? undefined}
						onChange={handleChange}
						onBlur={handleBlur}
					/>
					<Button
						type="button"
						onClick={() => handleShowPassword('password')}
						className="absolute right-2 top-2 z-10 text-gray-400 hover:text-blue-600 cursor-pointer"
						variant="unstyled"
					>
						{showPassword.password ? <EyeIcon /> : <EyeOff />}
					</Button>
					{touched.password && errors.password && (
						<Error error={errors.password} className="text-white" />
					)}
				</div>
				<div className="relative w-full max-w-md text-black mb-2">
					<input
						id="passwordConfirm"
						name="passwordConfirm"
						className="w-full bg-white p-2 rounded-md border border-gray-700"
						placeholder="Confirmar contraseña"
						type={
							showPassword.passwordConfirm ? 'text' : 'password'
						}
						value={values.passwordConfirm ?? undefined}
						onChange={handleChange}
						onBlur={handleBlur}
					/>
					<Button
						type="button"
						onClick={() => handleShowPassword('passwordConfirm')}
						className="absolute right-2 top-2 z-10 text-gray-400 hover:text-blue-600 cursor-pointer"
						variant="unstyled"
					>
						{showPassword.passwordConfirm ? (
							<EyeIcon />
						) : (
							<EyeOff />
						)}
					</Button>
					{touched.passwordConfirm && errors.passwordConfirm && (
						<Error
							error={errors.passwordConfirm}
							className="text-white"
						/>
					)}
				</div>
				<Button
					type="submit"
					className="bg-[#F4D434] text-gray-700 font-medium mt-3 p-2 cursor-pointer"
					disabled={!errors}
					variant="unstyled"
				>
					Guardar cambios
				</Button>
			</form>
		</div>
	);
};
