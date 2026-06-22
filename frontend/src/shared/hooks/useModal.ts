import { useState } from 'react';

export const useModal = (
	initialState: boolean = false
): [
	showModal: boolean,
	handleShowModal: () => void,
	handleCloseModal: () => void,
] => {
	const [showModal, setShowModal] = useState(initialState);

	const handleCloseModal = () => setShowModal(false);

	const handleShowModal = () => setShowModal(true);

	return [showModal, handleShowModal, handleCloseModal];
};
