import { FormikTouched, FormikErrors } from 'formik';
import { TCreateUser } from '../schemas';

export interface ICreateUserProps {
	touched: FormikTouched<TCreateUser>;
	values: TCreateUser;
	// setValues: (values: TCreateUser) => void;
	setValues: (
		values: React.SetStateAction<TCreateUser>,
		shouldValidate?: boolean
	) => Promise<void> | Promise<FormikErrors<TCreateUser>>;
	// errors: FormikErrors<TCreateUser>;
	errors: { [K in keyof TCreateUser]?: string };
	handleBlur: {
		(e: React.FocusEvent<HTMLInputElement, Element>): void;
		<T = string | React.FocusEvent<HTMLInputElement, Element>>(fieldOrEvent: T): T extends string ? (e: React.FocusEvent<HTMLInputElement, Element>) => void : void;
	};
}

export type TTeacherBasicInfo = {
	name: string;
	email: string | null;
	code: string;
	id: string;
	userId: string;
};
