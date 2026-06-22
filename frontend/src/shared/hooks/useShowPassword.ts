import { useState, useCallback } from 'react';

export const useShowPassword = <T>(initialState: T) => {
	const [showPassword, setShowPassword] = useState(initialState);

	const handleShowPassword = useCallback(
		(field: keyof typeof initialState) => {
			setShowPassword(prev => ({
				...prev,
				[field]: !prev[field],
			}));
		},
		[]
	);

	return { showPassword, handleShowPassword };
};
