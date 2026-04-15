export const TagError = ({ text }: { text?: string }) => {
	return (
		<div className="bg-yellow-500 text-black p-6 rounded-lg shadow-lg max-w-2xl mx-auto mt-4">
			<p className="text-1xl font-semibold">
				{text ?? 'No se encontraron datos disponibles.'}
			</p>
		</div>
	);
};
