import { useEffect, useState } from 'react';
import { FiSave } from 'react-icons/fi';
import { Button, ModalBase } from '@shared/components';
import { TAcademicCommonProps } from '@api/periods';
import {
	useCreateUndergrad,
	useUpdateUndergrad,
	useCreatePostgrad,
	useUpdatePostgrad,
} from '@api/degrees';

type DegreeType = 'undergrad' | 'postgrad';

interface DegreeFormModalProps {
	isOpen: boolean;
	onClose: () => void;
	degreeType: DegreeType;
	degree?: TAcademicCommonProps;
}

const LABELS: Record<DegreeType, { singular: string; article: string }> = {
	undergrad: { singular: 'Pregrado', article: 'el' },
	postgrad: { singular: 'Posgrado', article: 'el' },
};

export const DegreeFormModal = ({
	isOpen,
	onClose,
	degreeType,
	degree,
}: DegreeFormModalProps) => {
	const isEdit = !!degree;
	const label = LABELS[degreeType];

	const [name, setName] = useState('');
	const [error, setError] = useState('');

	const {
		mutateAsync: createUndergrad,
		isPending: isPendingCreateUndergrad,
	} = useCreateUndergrad();
	const { updateUndergrad, isPendingUpdate: isPendingUpdateUndergrad } =
		useUpdateUndergrad(degree?.id ?? '');
	const { mutateAsync: createPostgrad, isPending: isPendingCreatePostgrad } =
		useCreatePostgrad();
	const { updatePostgrad, isPendingUpdate: isPendingUpdatePostgrad } =
		useUpdatePostgrad(degree?.id ?? '');

	const isPending =
		isPendingCreateUndergrad ||
		isPendingUpdateUndergrad ||
		isPendingCreatePostgrad ||
		isPendingUpdatePostgrad;

	useEffect(() => {
		if (isOpen) {
			setName(degree?.name ?? '');
			setError('');
		}
	}, [isOpen, degree]);

	const validate = (): boolean => {
		if (name.trim().length < 3) {
			setError('El nombre debe tener al menos 3 caracteres.');
			return false;
		}
		if (name.trim().length > 150) {
			setError('El nombre no puede superar los 150 caracteres.');
			return false;
		}
		setError('');
		return true;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!validate()) return;

		const body = { name: name.trim() };

		if (degreeType === 'undergrad') {
			if (isEdit) {
				await updateUndergrad({ id: degree!.id, body });
			} else {
				await createUndergrad(body);
			}
		} else {
			if (isEdit) {
				await updatePostgrad({ id: degree!.id, body });
			} else {
				await createPostgrad(body);
			}
		}

		onClose();
	};

	return (
		<ModalBase isOpen={isOpen} onClose={onClose}>
			<div className="p-2">
				<h1 className="text-xl font-bold text-slate-800 mb-1">
					{isEdit
						? `Editar ${label.singular}`
						: `Crear Nuevo ${label.singular}`}
				</h1>
				<p className="text-xs text-gray-500 mb-5">
					{isEdit
						? `Modifica el nombre de ${label.article} ${label.singular.toLowerCase()}.`
						: `Ingresa el nombre del nuevo ${label.singular.toLowerCase()}.`}
				</p>

				<form onSubmit={handleSubmit} className="space-y-5">
					<div>
						<label className="block text-sm font-semibold text-gray-700 mb-2">
							Nombre del {label.singular.toLowerCase()}
						</label>
						<input
							type="text"
							value={name}
							onChange={e => {
								setName(e.target.value);
								if (error) setError('');
							}}
							placeholder={`Ej. Ingeniería en Sistemas`}
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-hidden focus:ring-2 focus:ring-green-200 focus:border-transparent text-sm"
							disabled={isPending}
							autoFocus
						/>
						{error && (
							<p className="mt-1 text-xs text-red-500">{error}</p>
						)}
					</div>

					<div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
						<Button
							type="button"
							variant="outline"
							onClick={onClose}
							disabled={isPending}
						>
							Cancelar
						</Button>
						<Button
							type="submit"
							className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
							disabled={isPending}
						>
							{!isPending && <FiSave className="size-4" />}
							<span>
								{isPending
									? 'Guardando...'
									: isEdit
										? `Actualizar ${label.singular}`
										: `Guardar ${label.singular}`}
							</span>
						</Button>
					</div>
				</form>
			</div>
		</ModalBase>
	);
};
