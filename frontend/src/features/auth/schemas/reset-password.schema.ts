import { z } from 'zod';

export const forgotPasswordSchema = z.object({
	email: z.email('El correo debe seguir el formato example@unah.edu.com'),
});

export const resetPasswordSchema = z
	.object({
		password: z
			.string()
			.min(8, {
				error: 'La contraseña debe tener al menos 8 caracteres.',
			})
			.max(50, {
				error: 'La contraseña no puede superar los 50 caracteres.',
			})
			.regex(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
				error: 'La contraseña debe contener al menos una letra mayúscula, una letra minúscula y un número o carácter especial.',
			}),
		passwordConfirm: z.string({
			error: 'Por favor confirma tu contraseña.',
		}),
	})
	.refine(data => data.password === data.passwordConfirm, {
		error: 'Las constraseñas no coinciden.',
		path: ['passwordConfirm'],
	});
