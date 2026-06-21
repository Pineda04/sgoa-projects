import React, { useRef, useState } from 'react';
import { PhotoIcon } from '@heroicons/react/24/outline';

export const ImagenesUpload = () => {
	const [imagenesPreview, setImagenesPreview] = useState<string[]>([]);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleFiles = (files: FileList) => {
		// const nuevasImagenes: string[] = []; // Esto se va a usar despues, de momento dejar comentado

		Array.from(files).forEach(file => {
			if (file && file.type.startsWith('image/')) {
				const reader = new FileReader();
				reader.onloadend = () => {
					setImagenesPreview(prev => [
						...prev,
						reader.result as string,
					]);
				};
				reader.readAsDataURL(file);
			}
		});
	};

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files) {
			handleFiles(e.target.files);
		}
	};

	const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		if (e.dataTransfer.files) {
			handleFiles(e.dataTransfer.files);
		}
	};

	return (
		<div
			className="w-fit mx-auto border-3 border-dashed border-gray-400 rounded-lg p-6 text-center cursor-pointer hover:bg-gray-100 transition"
			onDragOver={e => e.preventDefault()}
			onDrop={handleDrop}
			onClick={() => fileInputRef.current?.click()}
		>
			{/*Texto e iconos dentro del input de imagen*/}
			<p className="text-gray-500 mb-4">
				Arrastra varias imágenes aquí o haz clic para seleccionar
			</p>
			<PhotoIcon className="size-48 mx-auto" />
			<input
				ref={fileInputRef}
				type="file"
				accept="image/*"
				multiple
				className="hidden"
				onChange={handleChange}
			/>

			{/*Esto es para una vista previa de las imagenes que puso el usuario*/}
			<div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
				{imagenesPreview.map((src, index) => (
					<img
						key={index}
						src={src}
						alt={`Imagen ${index + 1}`}
						className="max-h-40 rounded-md shadow"
					/>
				))}
			</div>
		</div>
	);
};
