export const downloadBlob = (blob: Blob, fileName: string) => {
	const url = URL.createObjectURL(blob);

	try {
		const link = document.createElement('a');
		link.href = url;
		link.download = fileName;
		document.body.appendChild(link);

		try {
			link.click();
		} finally {
			link.remove();
		}
	} finally {
		setTimeout(() => URL.revokeObjectURL(url), 1000);
	}
};
