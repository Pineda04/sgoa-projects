import { useEffect, useState } from 'react';
import { EPdfFont, getPdfFontPreference, setPdfFontPreference } from '@config';

interface PdfFontSelectorProps {
	onChange?: (font: EPdfFont) => void;
}

export function PdfFontSelector({ onChange }: PdfFontSelectorProps) {
	const [selectedFont, setSelectedFont] = useState<EPdfFont>(
		EPdfFont.Calibri
	);

	useEffect(() => {
		setSelectedFont(getPdfFontPreference());
	}, []);

	const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		const font = e.target.value as EPdfFont;
		setSelectedFont(font);
		setPdfFontPreference(font);
		onChange?.(font);
	};

	return (
		<select
			value={selectedFont}
			onChange={handleChange}
			className="w-auto bg-gray-100 cursor-pointer shadow-md rounded-md px-3 py-2 outline-none border border-input focus:ring-2 focus:ring-primary/20 transition-colors"
		>
			<option value={EPdfFont.Calibri}>Calibri</option>
			<option value={EPdfFont.TimesNewRoman}>Times New Roman</option>
		</select>
	);
}
