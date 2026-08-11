import { PlusCircleIcon } from 'lucide-react';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';
import { askDel } from '@shared/utils/delete-action';
import { PreviewImages } from './PreviewImages';
import { activityRegistrationStatus, EActivityType } from '@shared/constants';
import { useModal } from '@shared/hooks';
import { Button, ModalBase } from '@shared/components';
import { ComplementaryActivity } from './ComplementaryActivity';
import {
	TComplementaryActivity,
	useDeleteComplementaryActivity,
} from '@api/activities';

export const TableActivities = ({
	reportId,
	activityType,
	activities,
	mode,
}: {
	reportId: string;
	activityType: EActivityType;
	activities: TComplementaryActivity[];
	mode: 'view' | 'edit';
}) => {
	const { delComplementaryActivity } =
		useDeleteComplementaryActivity(reportId);

	// Modal
	const [showModal, handleShowModal, handleCloseModal] = useModal();

	// Edit Activity
	const [editActivity, setEditActivity] = useState<
		TComplementaryActivity | undefined
	>(undefined);

	useEffect(() => {
		if (showModal && editActivity) {
			const updateActivity = activities.find(
				ac => ac.id === editActivity.id
			);

			if (
				updateActivity &&
				(updateActivity !== editActivity ||
					updateActivity.verificationMedia.verificationMediaFiles
						.length !==
						editActivity.verificationMedia.verificationMediaFiles
							.length)
			)
				setEditActivity(
					activities.find(ac => ac.id === editActivity.id)
				);
		}
	}, [activities, showModal, editActivity]);

	const handleDelete = (id: string) =>
		askDel(id, 'eliminar la actividad', delComplementaryActivity);

	const handleEditActivity = (id: string) => {
		setEditActivity(activities.find(ac => ac.id === id));
		handleShowModal();

		return;
	};

	return (
		<div className="space-y-4">
			{/* Modal */}
			<div className="flex justify-center pt-2">
				{mode === 'edit' && (
					<Button
						type="button"
						onClick={() => {
							setEditActivity(undefined);
							handleShowModal();
						}}
						className="bg-[#5BC85C] text-white p-2 hover:bg-green-300 transition duration-500"
						variant="unstyled"
					>
						<PlusCircleIcon className="size-5" />
						Agregar actividad
					</Button>
				)}
				<ModalBase isOpen={showModal} onClose={handleCloseModal}>
					<ComplementaryActivity
						reportId={reportId}
						activityType={activityType}
						onClose={handleCloseModal}
						initialValuesData={editActivity}
					/>
				</ModalBase>
			</div>
			<div className="overflow-x-auto rounded-lg shadow-md mx-auto">
				<table className="w-full min-w-175 text-sm">
					<thead className="bg-[#144C74] text-white">
						{activityRegistrationStatus[activityType] && (
							<tr>
								<th className="py-3 px-4" colSpan={2}></th>
								<th
									className="py-3 px-4 text-center font-semibold"
									colSpan={2}
								>
									¿Registrado?
								</th>
								<th className="py-3 px-4" colSpan={5}></th>
							</tr>
						)}
						<tr>
							<th className="py-3 px-4 font-semibold">No.</th>
							<th className="py-3 px-4 font-semibold">
								Nombre del proyecto
							</th>
							{activityRegistrationStatus[activityType] && (
								<>
									<th className="py-3 px-4 font-semibold">
										Si
									</th>
									<th className="py-3 px-4 font-semibold">
										No
									</th>
									<th className="py-3 px-4 font-semibold">
										No. de Expediente
									</th>
								</>
							)}
							<th className="py-3 px-4 font-semibold">
								Nivel de avance
							</th>
							<th className="py-3 px-4 font-semibold">
								Medio de verificación
							</th>
							<th className="py-3 px-4 font-semibold">
								Archivos del medio de verificación
							</th>
							{mode === 'edit' && (
								<th className="py-3 px-4 font-semibold">
									Acciones
								</th>
							)}
						</tr>
					</thead>
					<tbody className="text-center text-sm text-foreground [&>tr:nth-child(odd)]:bg-white [&>tr:nth-child(even)]:bg-gray-100 hover:bg-gray-200 transition-colors duration-150">
						{activities.map((ac, index) => (
							<tr id={ac.id} key={ac.id}>
								<td className="py-3 px-4">{index + 1}</td>
								<td className="py-3 px-4">{ac.name}</td>
								{ac.isRegistered !== null && (
									<>
										<td className="py-3 px-4">
											<input
												type="checkbox"
												checked={ac.isRegistered}
												disabled
											/>
										</td>
										<td className="py-3 px-4">
											<input
												type="checkbox"
												checked={!ac.isRegistered}
												disabled
											/>
										</td>
										<td className="py-3 px-4">
											{ac.fileNumber ?? (
												<p className="text-red-400">
													———
												</p>
											)}
										</td>
									</>
								)}
								<td className="py-3 px-4">
									{ac.progressLevel}
								</td>
								<td className="py-3 px-4">
									{!ac.verificationMedia ? (
										<p className="text-red-400">
											Sin descripción...
										</p>
									) : (
										ac.verificationMedia.description
									)}
								</td>
								<td className="py-3 px-4">
									<PreviewImages
										reportId={reportId}
										verificationMedia={ac.verificationMedia}
									/>
								</td>
								{mode === 'edit' && (
									<td className="py-3 px-4">
										<Button
											onClick={() =>
												handleEditActivity(ac.id)
											}
											variant="unstyled"
										>
											<PencilIcon className="size-6 text-[#015420] hover:text-green-800 cursor-pointer" />
										</Button>
										<Button
											onClick={() => handleDelete(ac.id)}
											variant="unstyled"
										>
											<TrashIcon className="size-6 text-[#DC3545] hover:text-red-800 cursor-pointer" />
										</Button>
									</td>
								)}
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
};
