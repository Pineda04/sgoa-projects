import LogoUNAH from '/logo-unah-2.webp';
import { useFormik } from 'formik';
import {
	ArrowLeft,
	EyeIcon,
	EyeOff,
	GraduationCap,
	Lock,
} from 'lucide-react';
import { useEffect } from 'react';
import {
	useSearchParams,
	useNavigate,
	Link,
} from 'react-router-dom';
import { resetPasswordSchema } from '../schemas';
import { TResetPassword, useResetPassword } from '@api/auth';
import { Button, Error, errorsFormik, useShowPassword } from '@shared';

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
		// if (!params.get("token")) navigate(`/auth/login`);
		if (!token) navigate(`/auth/login`);
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
		if (!token) return navigate(`/auth/login`);

		await mutateAsync({
			...values,
			token,
		});

		navigate(`/auth/login`);

		setValues({
			password: '',
			passwordConfirm: '',
		});
	};

	useEffect(() => {
			if (isError) navigate(`/auth/login`);
	}, [isError]);

	return (
		<div className="grid lg:grid-cols-2 h-screen">
			<div className="relative flex items-center justify-center overflow-hidden bg-linear-to-br from-primary via-[#1a5c8a] to-[#0d3556] min-h-[40vh] lg:min-h-auto">
				<div className="absolute inset-0 opacity-10">
					<svg
						className="w-full h-full"
						xmlns="http://www.w3.org/2000/svg"
					>
						<defs>
							<pattern
								id="grid"
								width="40"
								height="40"
								patternUnits="userSpaceOnUse"
							>
								<path
									d="M 40 0 L 0 0 0 40"
									fill="none"
									stroke="white"
									strokeWidth="0.5"
								/>
							</pattern>
						</defs>
						<rect width="100%" height="100%" fill="url(#grid)" />
					</svg>
				</div>

				<div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
					<div className="absolute -top-20 -left-20 w-64 h-64 md:w-96 md:h-96 bg-white/5 rounded-full blur-3xl"></div>
					<div className="absolute bottom-0 right-0 w-56 h-56 md:w-80 md:h-80 bg-accent/10 rounded-full blur-3xl"></div>
				</div>

				<div className="relative z-10 flex flex-col items-center text-center p-6 md:p-8 animate-in slide-up">
					<div className="mb-4 md:mb-6 p-3 md:p-4">
						<img
							src={LogoUNAH}
							alt="Logo UNAH"
							className="w-20 h-auto md:w-28 object-contain"
						/>
					</div>

					<h1 className="text-3xl md:text-4xl lg:text-5xl font-display text-white mb-3 md:mb-4 tracking-tight">
						SGOA UNAH
					</h1>

					<p className="text-white/80 text-base md:text-lg lg:text-xl font-sans max-w-md leading-relaxed px-4">
						Sistema de Gestión y <br />
						Organización Académica
					</p>

					<div className="mt-6 md:mt-8 flex items-center gap-2 text-white/60 text-xs md:text-sm">
						<GraduationCap className="w-4 h-4" />
						<span className="hidden sm:inline">
							Universidad Nacional Autónoma de Honduras
						</span>
						<span className="sm:hidden">UNAH</span>
					</div>
				</div>
			</div>

			<div className="bg-background flex flex-col items-center justify-center p-4 sm:p-6 md:p-8">
				<div className="w-full max-w-md animate-in slide-up stagger-2">
					<div className='p-6 sm:p-8'>
						<div className="my-8 text-center">
							<h2 className="text-2xl sm:text-3xl font-display text-foreground mb-2">
								Restablecer contraseña
							</h2>
							<p className="text-muted-foreground text-sm">
								Ingresa tu nueva contraseña para continuar
							</p>
						</div>

						<form onSubmit={handleSubmit} className="space-y-5">
							<div className="space-y-1.5">
								<label
									htmlFor="password"
									className="text-sm font-medium text-foreground"
								>
									Nueva contraseña
								</label>
								<div className="relative">
									<Lock className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/60" />
									<input
										id="password"
										name="password"
										className="w-full h-11 pl-10 pr-12 bg-card border border-border rounded-lg
											outline-none text-foreground placeholder:text-muted-foreground/60
											font-medium transition-all duration-200
											focus:border-primary focus:ring-2 focus:ring-primary/20 focus:shadow-lg focus:shadow-primary/10
											hover:border-border-strong"
										placeholder="••••••••"
										type={
											showPassword.password
												? 'text'
												: 'password'
										}
										autoComplete="new-password"
										value={values.password ?? undefined}
										onChange={handleChange}
										onBlur={handleBlur}
									/>
									<Button
										type="button"
										onClick={() =>
											handleShowPassword('password')
										}
										className="absolute right-1 top-1/2 -translate-y-1/2 h-9 w-9 text-muted-foreground hover:text-primary transition-colors"
										variant="ghost"
										size="icon"
									>
										{showPassword.password ? (
											<EyeOff className="w-4 h-4" />
										) : (
											<EyeIcon className="w-4 h-4" />
										)}
									</Button>
								</div>
								{touched.password && errors.password && (
									<Error
										error={errors.password}
										breakLine={false}
										className="text-destructive ml-1 text-xs"
									/>
								)}
							</div>

							<div className="space-y-1.5">
								<label
									htmlFor="passwordConfirm"
									className="text-sm font-medium text-foreground"
								>
									Confirmar contraseña
								</label>
								<div className="relative">
									<Lock className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/60" />
									<input
										id="passwordConfirm"
										name="passwordConfirm"
										className="w-full h-11 pl-10 pr-12 bg-card border border-border rounded-lg
											outline-none text-foreground placeholder:text-muted-foreground/60
											font-medium transition-all duration-200
											focus:border-primary focus:ring-2 focus:ring-primary/20 focus:shadow-lg focus:shadow-primary/10
											hover:border-border-strong"
										placeholder="••••••••"
										type={
											showPassword.passwordConfirm
												? 'text'
												: 'password'
										}
										autoComplete="new-password"
										value={
											values.passwordConfirm ?? undefined
										}
										onChange={handleChange}
										onBlur={handleBlur}
									/>
									<Button
										type="button"
										onClick={() =>
											handleShowPassword('passwordConfirm')
										}
										className="absolute right-1 top-1/2 -translate-y-1/2 h-9 w-9 text-muted-foreground hover:text-primary transition-colors"
										variant="ghost"
										size="icon"
									>
										{showPassword.passwordConfirm ? (
											<EyeOff className="w-4 h-4" />
										) : (
											<EyeIcon className="w-4 h-4" />
										)}
									</Button>
								</div>
								{touched.passwordConfirm &&
									errors.passwordConfirm && (
										<Error
											error={errors.passwordConfirm}
											breakLine={false}
											className="text-destructive ml-1 text-xs"
										/>
									)}
							</div>

							<Button
								type="submit"
								className="w-full h-11 mt-1 bg-primary hover:bg-primary-hover hover:shadow-xl hover:shadow-primary/20 hover:-translate-y-0.5 active:translate-y-0 text-base"
								variant="default"
							>
								Guardar cambios
							</Button>
						</form>

						<p className="mt-6 text-center">
							<Link
								to="/auth/login"
								className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
							>
								<ArrowLeft className="size-4" />
								Volver a iniciar sesión
							</Link>
						</p>
					</div>
				</div>
			</div>
		</div>
	);
};
