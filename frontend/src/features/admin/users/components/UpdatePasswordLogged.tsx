import { TResetPassword } from '@api/auth';
import { useUpdateUser } from '@api/users';
import { useAuth } from '@config/providers';
import { resetPasswordSchema } from '@features/auth';
import { Button, Error, Loading } from '@shared/components';
import { useShowPassword } from '@shared/hooks';
import { errorsFormik } from '@shared/utils';
import { useFormik } from 'formik';
import { EyeIcon, EyeOff } from 'lucide-react';
import { FiSave } from 'react-icons/fi';

export const UpdatePasswordLogged = ({
	onCancel,
}: {
	onCancel: () => void;
}) => {
	const {
		authState: { user },
	} = useAuth();
	const { updateUser, isPendingUpdate } = useUpdateUser(user!.sub);
	const { showPassword, handleShowPassword } = useShowPassword({
		password: false,
		passwordConfirm: false,
	});

	const { values, errors, touched, handleBlur, handleChange, handleSubmit } =
		useFormik<TResetPassword>({
			initialValues: { password: '', passwordConfirm: '' },
			onSubmit: values => onSubmitting(values),
			validateOnChange: true,
			validate: values => {
				const result = resetPasswordSchema.safeParse(values);
				if (result.success) return;
				return errorsFormik<TResetPassword>(result);
			},
		});

	const onSubmitting = async (values: TResetPassword) => {
		await updateUser({ body: values });
		onCancel();
	};

	return (
		<>
			{isPendingUpdate && <Loading />}
			<h1 className="text-xl font-bold mb-5 text-black">
				Cambiar Contraseña
			</h1>
			<hr className="h-px my-2 bg-gray-200 border-0" />

			<form
				onSubmit={handleSubmit}
				className="overflow-auto grid grid-cols-1 md:grid-cols-2 gap-4 text-black"
			>
				{(
					[
						{
							id: 'password',
							name: 'password',
							placeholder: 'Nueva contraseña',
							isShow: showPassword.password,
							current: 'password',
						},
						{
							id: 'passwordConfirm',
							name: 'passwordConfirm',
							placeholder: 'Confirmar contraseña',
							isShow: showPassword.passwordConfirm,
							current: 'passwordConfirm',
						},
					] as {
						id: string;
						name: keyof TResetPassword;
						placeholder: string;
						isShow: boolean;
						current: keyof typeof showPassword;
					}[]
				).map(({ id, name, placeholder, isShow, current }) => (
					<>
						<div className="relative mt-3">
							<input
								id={id}
								name={name}
								className="w-full p-2 rounded-md border border-gray-700"
								placeholder={placeholder}
								type={isShow ? 'text' : 'password'}
								value={(values[name] as string) ?? undefined}
								onChange={handleChange}
								onBlur={handleBlur}
							/>
							<Button
								type="button"
								onClick={() => handleShowPassword(current)}
								className="absolute h-full right-2 z-10 text-gray-400 hover:text-blue-600 cursor-pointer"
								variant="unstyled"
							>
								{isShow ? <EyeIcon /> : <EyeOff />}
							</Button>
							{touched[name] && errors[name] && (
								<Error error={errors[name]} />
							)}
						</div>
					</>
				))}
				<div className="flex flex-col sm:flex-row sm:justify-end md:col-span-2 mx-auto sm:mx-0">
					<Button type="button" variant="outline" onClick={onCancel}>
						Cancelar
					</Button>
					<Button
						type="submit"
						className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2 ml-2"
						disabled={!errors}
          >
            <FiSave className="size-4" />
            <span>
              Actualizar Contraseña
						</span>
					</Button>
				</div>
			</form>
		</>
	);
};
