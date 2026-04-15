import { z } from 'zod';

export const loginSchema = z.object({
	email: z.email('El correo no es válido.'),
	password: z
		.string()
		.nonempty({ error: 'El campo de contraseña es obligatorio.' }),
});
