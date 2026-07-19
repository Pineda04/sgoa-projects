import { useState, useEffect } from 'react';
import { FiSave } from 'react-icons/fi';
import { useUpdateDepartment } from '@api/departments';
import { TOutputDepartment } from '@api/departments';
import { useGetAllFaculties } from '@api/faculties';
import { TFaculty } from '@api/faculties';
import { Button, ModalBase } from '@shared';

interface EditDepartmentModalProps {
	isOpen: boolean;
	onClose: () => void;
	department: TOutputDepartment | null;
}

export const EditDepartmentModal = ({
	isOpen,
	onClose,
	department,
}: EditDepartmentModalProps) => {
	const [name, setName] = useState('');
	const [uvs, setUvs] = useState<number | null>(null);
	const [facultyId, setFacultyId] = useState('');
	const { updateDepartment, isPendingUpdate: isPending } =
		useUpdateDepartment(department?.id ?? '');
	const faculties = useGetAllFaculties();

	useEffect(() => {
		if (department) {
			setName(department.name);
			setUvs(department.uvs);
			setFacultyId(department.facultyId);
		} else {
			setName('');
			setUvs(null);
			setFacultyId('');
		}
	}, [department, isOpen]);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!name.trim() || !department || !facultyId) return;

		updateDepartment({
			id: department.id,
			body: { name, uvs, facultyId },
		})
			.then(() => {
				onClose();
			})
			.catch(error => {
				console.error('Error al actualizar:', error);
			});
	};

	return (
		<ModalBase isOpen={isOpen} onClose={onClose}>
			<div className="p-2">
				<h1 className="text-xl font-bold text-slate-800 mb-1">
					Editar Departamento
				</h1>
				<p className="text-xs text-gray-500 mb-5">
					Modifica los datos del departamento seleccionado.
				</p>

				<form onSubmit={handleSubmit} className="space-y-5">
					<div>
						<label className="block text-sm font-semibold text-gray-700 mb-2">
							Nombre del Departamento
						</label>
						<input
							type="text"
							value={name}
							onChange={e => setName(e.target.value)}
							placeholder="Ej. Ingeniería en Sistemas"
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-hidden focus:ring-2 focus:ring-green-200 focus:border-transparent text-sm"
							required
							disabled={isPending}
						/>
					</div>

					<div>
						<label className="block text-sm font-semibold text-gray-700 mb-2">
							Unidades Valorativas
						</label>
						<input
							type="number"
							value={uvs ?? ''}
							onChange={e => {
								const raw = e.target.value;
								setUvs(raw === '' ? null : parseInt(raw, 10));
							}}
							placeholder="Ej. 30 (opcional)"
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-hidden focus:ring-2 focus:ring-green-200 focus:border-transparent text-sm"
							min={0}
							disabled={isPending}
						/>
					</div>

					<div>
						<label className="block text-sm font-semibold text-gray-700 mb-2">
							Facultad
						</label>
						<select
							value={facultyId}
							onChange={e => setFacultyId(e.target.value)}
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-hidden focus:ring-2 focus:ring-green-200 focus:border-transparent text-sm bg-white"
							required
							disabled={isPending || faculties.isLoading}
						>
							<option value="" disabled>
								Seleccione una facultad
							</option>
							{(faculties.data as TFaculty[] | undefined)?.map(
								f => (
									<option key={f.id} value={f.id}>
										{f.name}
									</option>
								)
							)}
						</select>
					</div>

					<div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-4">
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
									: 'Actualizar Departamento'}
							</span>
						</Button>
					</div>
				</form>
			</div>
		</ModalBase>
	);
};
