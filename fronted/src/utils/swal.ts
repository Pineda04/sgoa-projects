import { IResponse } from '@types';
import { AxiosResponse } from 'axios';

export enum ESwalIcons {
	SUCCESS = 'success',
	ERROR = 'error',
}

const getSwal = async () => {
	const module = await import('sweetalert2');
	return module.default;
};

export const genericAlert = async (
	title: string,
	icon: ESwalIcons = ESwalIcons.SUCCESS,
	timer: number = 1500
) => {
	const Swal = await getSwal();
	return Swal.fire({
		position: 'top-end',
		icon,
		html: title,
		showConfirmButton: false,
		timer,
		toast: true,
		background: '#f4d434',
		color: '#144c74',
		iconColor: '#144c74',
	});
};

export const alertSuccess = async (res: AxiosResponse<IResponse<unknown>>) =>
	genericAlert(res.data.message);
