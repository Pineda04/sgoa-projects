import React, { useRef, useState } from 'react';
import { DocumentArrowUpIcon } from '@heroicons/react/24/outline';
import { TPlanification, TPlanificationWithErrors, useViewAcademicAssignmentMutation } from '@api/assignment-reports';
import { ESwalIcons, genericAlert } from '@shared/utils';
import { Button } from '@shared/components';

interface UploadPlanificationProps {
	centerDepartmentId: string;
	onUploadSuccess: (
		data: TPlanification[],
		invalidElements: TPlanificationWithErrors[]
	) => void;
	onCloseModal: () => void;
}

export const UploadPlanification = ({
	centerDepartmentId,
	onUploadSuccess,
	onCloseModal,
}: UploadPlanificationProps) => {
	const { mutateAsync } = useViewAcademicAssignmentMutation();
	const [excelFileName, setExcelFileName] = useState<string | null>(null);
	const [excelFile, setExcelFile] = useState<File | null>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleFile = (file: File) => {
		const validTypes = [
			'application/vnd.ms-excel', // .xls
			'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
		];

		if (validTypes.includes(file.type)) {
			setExcelFile(file);
			setExcelFileName(file.name);
		} else {
			genericAlert(
				'Solo se permiten archivos Excel (.xls, .xlsx)',
				ESwalIcons.ERROR
			);
			setExcelFile(null);
			setExcelFileName(null);
		}
	};

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files[0]) {
			handleFile(e.target.files[0]);
		}
	};

	const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		if (e.dataTransfer.files && e.dataTransfer.files[0]) {
			handleFile(e.dataTransfer.files[0]);
		}
	};

	const handleUpload = async () => {
		if (!excelFile) {
			genericAlert(
				'Por favor selecciona un archivo Excel',
				ESwalIcons.ERROR
			);
			return;
		}

		const formData = new FormData();
		formData.append('file', excelFile);

		mutateAsync(
			{
				centerDepartmentId,
				formData,
			},
			{
				onSuccess: response => {
					if (response.data.data && response.data.data.courses) {
						onUploadSuccess(
							response.data.data.courses,
							response.data.data.invalidElements
						);
						onCloseModal();
					}
				},
			}
		);
	};

	return (
		<>
			<h2 className="text-2xl font-semibold text-center py-10">
				Registro de nueva de planificación académica
			</h2>
			<div
				className="w-fit mx-auto border-3 border-dashed border-gray-400 rounded-lg p-6 text-center cursor-pointer hover:bg-gray-100 transition"
				onDragOver={e => e.preventDefault()}
				onDrop={handleDrop}
				onClick={() => fileInputRef.current?.click()}
			>
				{/* Texto e icono */}
				<p className="text-gray-500 mb-4">
					Arrastra tu archivo Excel aquí o haz clic para seleccionar
				</p>
				<DocumentArrowUpIcon className="size-24 mx-auto text-green-600" />

				{/* Input oculto */}
				<input
					ref={fileInputRef}
					type="file"
					accept=".xls,.xlsx"
					className="hidden"
					onChange={handleChange}
				/>

				{/* Vista previa: solo nombre de archivo */}
				{excelFileName && (
					<div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md shadow">
						<p className="text-sm font-medium text-green-700 truncate">
							{excelFileName}
						</p>
					</div>
				)}
			</div>

			<Button
				type="button"
				onClick={handleUpload}
				className="mx-auto w-fit justify-center mt-10 mb-50
         bg-[#C40C54] text-white p-2 hover:bg-pink-500
         transition flex flex-row gap-2 duration-500"
				variant="unstyled"
			>
				<DocumentArrowUpIcon className="size-6" />
				Subir planificación
			</Button>
		</>
	);
};
