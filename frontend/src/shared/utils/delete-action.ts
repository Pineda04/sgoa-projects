type TDeleteAction = (id: string) => Promise<unknown>;

export const askDel = async (
	id: string,
	message: string,
	action: TDeleteAction
) => {
	const Swal = (await import('sweetalert2')).default;
	return Swal.fire({
		text: `¿Está seguro que desea ${message}?`,
		showCancelButton: true,
		confirmButtonText: 'Si',
		cancelButtonText: 'No',
		customClass: {
			container: 'container-blur',
			confirmButton:
				'w-[75px] bg-[#DC3545] text-white p-2 hover:bg-red-300 rounded-md transition duration-500 cursor-pointer',
			cancelButton:
				'w-[75px] bg-gray-500 hover:bg-gray-300 p-2 font-medium text-white rounded-md ml-2 transition duration-500 cursor-pointer',
		},
		buttonsStyling: false,
		preConfirm: async () => {
			await action(id);
		},
	});
};
