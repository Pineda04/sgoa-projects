import { useEffect, useState } from 'react';
import { Button } from '@components/ui/button';
import { ModalBase } from '@components/ui/modals/ModalBase';
import { FiSave } from 'react-icons/fi';
import { ESwalIcons, genericAlert } from '@utils';
import { useUpdateAcademicPeriod } from '../hooks/mutations';
import type { TCurrentAcademicPeriod, TPacModality } from '../types';

interface EditAcademicPeriodModalProps {
	isOpen: boolean;
	onClose: () => void;
	period: TCurrentAcademicPeriod | null;
}

export const EditAcademicPeriodModal = ({
	isOpen,
	onClose,
	period,
}: EditAcademicPeriodModalProps) => {
	const [form, setForm] = useState({
		year: 0,
		pac: 1,
		pac_modality: 'Trimestre' as TPacModality,
		startDate: '',
		endDate: '',
	});

	const { mutate: updatePeriod, isPending } = useUpdateAcademicPeriod();

	useEffect(() => {
		if (period) {
			setForm({
				year: period.year,
				pac: period.pac,
				pac_modality: period.pac_modality,
				startDate: period.startDate?.slice(0, 10) ?? '',
				endDate: period.endDate?.slice(0, 10) ?? '',
			});
		}
	}, [period, isOpen]);

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
	) => {
		const { name, value } = e.target;
		setForm(prev => ({
			...prev,
			[name]: name === 'year' || name === 'pac' ? Number(value) : value,
		}));
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!period) return;

		updatePeriod(
			{
				id: period.id,
				data: {
					...form,
					startDate: form.startDate ? `${form.startDate}T00:00:00.000Z` : undefined,
					endDate: form.endDate ? `${form.endDate}T00:00:00.000Z` : undefined,
				},
			},
			{
				onSuccess: () => {
					genericAlert(
						'Periodo académico actualizado con éxito.',
						ESwalIcons.SUCCESS
					);
					onClose();
				},
				onError: () => {
					genericAlert(
						'No se pudo actualizar el periodo académico.',
						ESwalIcons.ERROR
					);
				},
			}
		);
	};

	return (
		<ModalBase isOpen={isOpen} onClose={onClose}>
			<div className="p-2">
				<h1 className="text-xl font-bold text-slate-800 mb-1">
					Editar Periodo Académico
				</h1>
				<p className="text-xs text-gray-500 mb-5">
					Modifica los datos del periodo seleccionado.
				</p>

				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
						<div>
							<label className="block text-sm font-semibold text-gray-700 mb-1">
								Año
							</label>
							<input
								type="number"
								name="year"
								value={form.year}
								onChange={handleChange}
								min={2000}
								max={2100}
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-hidden focus:ring-2 focus:ring-green-200 focus:border-transparent text-sm"
								required
								disabled={isPending}
							/>
						</div>

						<div>
							<label className="block text-sm font-semibold text-gray-700 mb-1">
								PAC
							</label>
							<input
								type="number"
								name="pac"
								value={form.pac}
								onChange={handleChange}
								min={1}
								max={4}
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-hidden focus:ring-2 focus:ring-green-200 focus:border-transparent text-sm"
								required
								disabled={isPending}
							/>
						</div>

						<div>
							<label className="block text-sm font-semibold text-gray-700 mb-1">
								Modalidad
							</label>
							<select
								name="pac_modality"
								value={form.pac_modality}
								onChange={handleChange}
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-hidden focus:ring-2 focus:ring-green-200 focus:border-transparent text-sm bg-white"
								required
								disabled={isPending}
							>
								<option value="Trimestre">Trimestre</option>
								<option value="Semestre">Semestre</option>
							</select>
						</div>

						<div>
							<label className="block text-sm font-semibold text-gray-700 mb-1">
								Fecha de inicio
							</label>
							<input
								type="date"
								name="startDate"
								value={form.startDate}
								onChange={handleChange}
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-hidden focus:ring-2 focus:ring-green-200 focus:border-transparent text-sm"
								disabled={isPending}
							/>
						</div>

						<div>
							<label className="block text-sm font-semibold text-gray-700 mb-1">
								Fecha de fin
							</label>
							<input
								type="date"
								name="endDate"
								value={form.endDate}
								onChange={handleChange}
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-hidden focus:ring-2 focus:ring-green-200 focus:border-transparent text-sm"
								disabled={isPending}
							/>
						</div>

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
							<span>{isPending ? 'Guardando...' : 'Actualizar Periodo'}</span>
						</Button>
					</div>
				</form>
			</div>
		</ModalBase>
	);
};
