import LogoUNAH from '/logo-unah-2.webp';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import { EyeIcon, EyeOff, GraduationCap } from 'lucide-react';
import { loginSchema } from '../schemas';
import { IAuthLogin, useForgotPassword } from '@api/auth';
import { useAuth } from '@config';
import {
	Button,
	Error,
	errorsFormik,
	ESwalIcons,
	genericAlert,
	useShowPassword,
} from '@shared';

type ForgotPasswordAction = (variables: { email: string }) => Promise<unknown>;

const askEmail = async (action: ForgotPasswordAction) => {
	const Swal = (await import('sweetalert2')).default;
	await Swal.fire({
		title: 'Recuperar contraseña',
		input: 'email',
		inputLabel: 'Ingresa tu correo electrónico',
		inputPlaceholder: 'correo@ejemplo.com',
		showCancelButton: true,
		confirmButtonText: 'Enviar',
		cancelButtonText: 'Cancelar',
		customClass: {
			container: 'container-blur',
			title: '!text-2xl/2 !m-5',
			confirmButton:
				'bg-accent mt-3 p-2 font-medium text-gray-700 rounded-md m-2 cursor-pointer',
			cancelButton:
				'bg-gray-300 mt-3 p-2 font-medium text-gray-700 rounded-md m-2 cursor-pointer',
		},
		buttonsStyling: false,
		inputValidator: value => {
			if (!value) return 'El correo es obligatorio';

			if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
				return 'Correo inválido';

			return null;
		},
		preConfirm: async email => {
			await action({ email });
		},
	});
};

export const Login = () => {
	const navigate = useNavigate();
	const { authState, login, cleanErrors } = useAuth();

	const { values, errors, touched, handleBlur, handleChange, handleSubmit } =
		useFormik<IAuthLogin>({
			initialValues: {
				email: '',
				password: '',
			},
			onSubmit: values => handleLogin(values),
			validateOnChange: true,
			validate: values => {
				const result = loginSchema.safeParse(values);

				if (result.success) return;

				return errorsFormik<IAuthLogin>(result);
			},
		});

	const { showPassword, handleShowPassword } = useShowPassword({
		password: false,
	});

	const { mutateAsync } = useForgotPassword();

	const handleLogin = async (values: IAuthLogin) => {
		const { email, password } = values;

		if (email.length < 3 && password.length < 3) return;

		try {
			await login({ email, password });

			const lastPath = localStorage.getItem('lastPath') || '/home';

			genericAlert('Inicio de sesion exitoso!');
			navigate(lastPath, { replace: true });
		} catch (error) {
			console.log('error: ', error);
		}
	};

	useEffect(() => {
		if (authState.errors) {
			genericAlert(authState.errors.toString(), ESwalIcons.ERROR);
			return cleanErrors(null);
		}
	}, [authState.errors]);

	useEffect(() => {
		if (authState.isAuthenticated) {
			const lastPath = localStorage.getItem('lastPath') || '/home';
			navigate(lastPath, { replace: true });
		}
	}, [authState.isAuthenticated]);

	return (
		<div className="grid lg:grid-cols-2 md:grid-cols-1 h-screen">
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
						SPI UNAH
					</h1>

					<p className="text-white/80 text-base md:text-lg lg:text-xl font-sans max-w-md leading-relaxed px-4">
						Sistema de Gestión Académica
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
				<div className="w-full max-w-sm animate-in slide-up stagger-2">
					<div className="mb-8 text-center">
						<h2 className="text-2xl sm:text-3xl font-display text-foreground mb-2">
							¡Bienvenido!
						</h2>
						<p className="text-muted-foreground text-sm">
							Ingresa tus credenciales para continuar
						</p>
					</div>

					<form onSubmit={handleSubmit} className="space-y-5">
						<div className="space-y-2">
							<label
								htmlFor="email"
								className="text-sm font-medium text-foreground ml-1"
							>
								Correo electrónico
							</label>
							<input
								id="email"
								name="email"
								className="w-full h-11 px-4 bg-card border border-border rounded-lg
									outline-none text-foreground placeholder:text-muted-foreground/60
									font-medium transition-all duration-200
									focus:border-primary focus:ring-2 focus:ring-primary/20 focus:shadow-lg focus:shadow-primary/10
									hover:border-border-strong"
								placeholder="correo@unah.hn"
								type="text"
								value={values.email}
								onChange={handleChange}
								onBlur={handleBlur}
								required
							/>
							{touched.email && errors.email && (
								<Error
									error={errors.email}
									className="text-destructive ml-1 text-sm"
								/>
							)}
						</div>

						<div className="space-y-2">
							<label
								htmlFor="password"
								className="text-sm font-medium text-foreground ml-1"
							>
								Contraseña
							</label>
							<div className="relative">
								<input
									id="password"
									name="password"
									className="w-full h-11 px-4 pr-12 bg-card border border-border rounded-lg
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
									value={values.password}
									onChange={handleChange}
									onBlur={handleBlur}
									required
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
									className="text-destructive ml-1 text-sm"
								/>
							)}
						</div>

						<Button
							type="button"
							onClick={() => askEmail(mutateAsync)}
							className="text-muted-foreground hover:text-primary text-sm font-normal"
							variant="ghost"
						>
							¿Olvidaste tu contraseña?
						</Button>

						<Button
							type="submit"
							className="w-full h-11 mt-2 bg-primary hover:bg-primary-hover hover:shadow-xl hover:shadow-primary/20 hover:-translate-y-0.5 active:translate-y-0"
							variant="default"
						>
							Iniciar Sesión
						</Button>
					</form>

					<p className="mt-8 text-center text-xs text-muted-foreground">
						© 2025 Universidad Nacional Autónoma de Honduras
					</p>
				</div>
			</div>
		</div>
	);
};
