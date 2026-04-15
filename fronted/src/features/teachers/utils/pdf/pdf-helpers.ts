//Se pasan a ese base64 las imagenes, eso es lo que acepta para los pdf
export const toBase64 = (imgUrl: string) =>
	fetch(imgUrl)
		.then(res => res.blob())
		.then(
			blob =>
				new Promise<string>((resolve, reject) => {
					const reader = new FileReader();
					reader.onloadend = () => resolve(reader.result as string);
					reader.onerror = reject;
					reader.readAsDataURL(blob);
				})
		);

//Formato de horas consulta y tutoria
export const formatHour = (data: string) => {
	if (!data) return '';

	const date = new Date(data);

	return date.toLocaleTimeString('es-HN', {
		hour: '2-digit',
		minute: '2-digit',
		hour12: true,
	});
};
