import { useEffect, useState } from 'react';
import { FiSave } from 'react-icons/fi';
import { Button, ModalBase } from '@shared/components';
import { TRole, useCreateRole, useUpdateRole } from '@api/roles';

interface RoleFormModalProps {
	isOpen: boolean;
	onClose: () => void;
	role?: TRole;
}

export const RoleFormModal = ({
	isOpen,
	onClose,
	role,
}: RoleFormModalProps) => {
	const isEdit = !!role;

	const [name, setName] = useState('');
	const [description, setDescription] = useState('');
	const [error, setError] = useState('');

	const { mutateAsync: createRole, isPending: isPendingCreate } =
		useCreateRole();
	const { updateRole, isPendingUpdate } = useUpdateRole(role?.id ?? '');

	const isPending = isPendingCreate || isPendingUpdate;

	useEffect(() => {
		if (isOpen) {
			setName(role?.name ?? '');
			setDescription(role?.description ?? '');
			setError('');
		}
	}, [isOpen, role]);

	const validate = (): boolean => {
		if (name.trim().length < 3) {
			setError('El nombre debe tener al menos 3 caracteres.');
			return false;
		}
		if (name.trim().length > 50) {
			setError('El nombre no puede superar los 50 caracteres.');
			return false;
		}
		setError('');
		return true;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!validate()) return;

		const body = {
			name: name.trim(),
			description: description.trim() || null,
		};

		if (isEdit) {
			await updateRole(body);
		} else {
			await createRole(body);
		}

		onClose();
	};

	return (
		<ModalBase isOpen={isOpen} onClose={onClose}>
			<div className="p-2">
				<h1 className="text-xl font-bold text-slate-800 mb-1">
					{isEdit ? 'Editar Rol' : 'Crear Nuevo Rol'}
				</h1>
				<p className="text-xs text-gray-500 mb-5">
					{isEdit
						? 'Modifica el nombre o la descripción del rol.'
						: 'Define un nombre para el nuevo rol. Los permisos se asignan luego desde la matriz de permisos.'}
				</p>

				<form onSubmit={handleSubmit} className="space-y-5">
					<div>
						<label className="block text-sm font-semibold text-gray-700 mb-2">
							Nombre del rol
						</label>
						<input
							type="text"
							value={name}
							onChange={e => {
								setName(e.target.value);
								if (error) setError('');
							}}
							placeholder="Ej. SECRETARIA_ACADEMICA"
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-hidden focus:ring-2 focus:ring-green-200 focus:border-transparent text-sm"
							disabled={isPending}
							autoFocus
						/>
						{error && (
							<p className="mt-1 text-xs text-red-500">{error}</p>
						)}
					</div>

					<div>
						<label className="block text-sm font-semibold text-gray-700 mb-2">
							Descripción
						</label>
						<textarea
							value={description}
							onChange={e => setDescription(e.target.value)}
							placeholder="Descripción breve del rol (opcional)"
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-hidden focus:ring-2 focus:ring-green-200 focus:border-transparent text-sm"
							rows={3}
							disabled={isPending}
						/>
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
										? 'Actualizar Rol'
										: 'Guardar Rol'}
							</span>
						</Button>
					</div>
				</form>
			</div>
		</ModalBase>
	);
};
