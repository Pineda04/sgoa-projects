import {
	forgotPasswordSchema,
	resetPasswordSchema,
} from '@features/auth/schemas';
import z from 'zod';

export type TForgotPassword = z.infer<typeof forgotPasswordSchema>;

export type TResetPassword = z.infer<typeof resetPasswordSchema>;

export type TResetPasswordWithToken = TResetPassword & { token: string };
