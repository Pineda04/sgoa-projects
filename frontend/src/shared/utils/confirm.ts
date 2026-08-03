export const askConfirm = async (
	message: string,
	confirmButtonText = 'Aceptar'
) => {
	const Swal = (await import('sweetalert2')).default;
	const result = await Swal.fire({
		text: message,
		showCancelButton: true,
		confirmButtonText,
		cancelButtonText: 'Cancelar',
		customClass: {
			container: 'container-blur',
			confirmButton:
				'bg-accent mt-3 p-2 font-medium text-gray-700 rounded-md m-2 cursor-pointer',
			cancelButton:
				'bg-gray-300 mt-3 p-2 font-medium text-gray-700 rounded-md m-2 cursor-pointer',
		},
		buttonsStyling: false,
	});
	return result.isConfirmed;
};
