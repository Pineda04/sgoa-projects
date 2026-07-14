import { Button, Error, ModalBase } from '@shared';
import { errorsFormik } from '@shared/utils';
import { useFormik } from 'formik';
import { useEffect } from 'react';
import { initialValuesPosition, positionCreateSchema, TCreatePosition } from '../schemas';
import { TOutputPosition } from '@api/positions';

interface PositionFormModalProps {
	isOpen: boolean;
	onClose: () => void;
	position?: TOutputPosition;
	onSubmit: (values: TCreatePosition) => Promise<void>;
	isPending?: boolean;
}

export const PositionFormModal = ({
	isOpen,
	onClose,
	position,
	onSubmit,
	isPending = false,
}: PositionFormModalProps) => {
	const formik = useFormik<TCreatePosition>({
		initialValues: initialValuesPosition,
		onSubmit: async values => {
			await onSubmit(values);
		},
		validate: values => {
			const result = positionCreateSchema.safeParse(values);
			if (result.success) return;
			return errorsFormik<TCreatePosition>(result);
		},
	});

	useEffect(() => {
		if (isOpen) {
			formik.setValues({ name: position?.name ?? '' });
		} else {
			formik.resetForm({ values: initialValuesPosition });
		}
	}, [isOpen, position]);

	return (
		<ModalBase isOpen={isOpen} onClose={onClose}>
			<div className="p-6 w-full max-w-md">
				<h2 className="text-xl font-semibold mb-4">
					{position ? 'Editar posición' : 'Nueva posición'}
				</h2>
				<form onSubmit={formik.handleSubmit}>
					<label className="block mb-2 font-bold" htmlFor="position-name">
						Nombre
					</label>
					<input
						id="position-name"
						name="name"
						type="text"
						className="w-full bg-gray-100 shadow-md rounded-md px-2 py-2 outline-none"
						onChange={formik.handleChange}
						onBlur={formik.handleBlur}
						value={formik.values.name}
					/>
					{formik.touched.name && formik.errors.name && (
						<Error error={formik.errors.name} />
					)}
					<div className="flex justify-end gap-3 mt-6">
						<Button type="button" onClick={onClose} className="bg-gray-300 text-gray-700">
							Cancelar
						</Button>
						<Button type="submit" className="bg-[#5BC85C] text-white">
							{isPending ? 'Guardando...' : 'Guardar'}
						</Button>
					</div>
				</form>
			</div>
		</ModalBase>
	);
};
