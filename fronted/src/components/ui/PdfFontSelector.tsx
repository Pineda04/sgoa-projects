import { useEffect, useState } from 'react';
import {
	EPdfFont,
	getPdfFontPreference,
	setPdfFontPreference,
} from '@lib/pdf-config';

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
			className="h-10 px-3 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#144C74] cursor-pointer md:h-11 md:px-4"
		>
			<option value={EPdfFont.Calibri}>Calibri</option>
			<option value={EPdfFont.TimesNewRoman}>Times New Roman</option>
		</select>
	);
}
