export enum EPdfFont {
	Calibri = 'Calibri',
	TimesNewRoman = 'Times New Roman',
}

const STORAGE_KEY = 'pdf-font-preference';
const DEFAULT_FONT = EPdfFont.Calibri;

export function getPdfFontPreference(): EPdfFont {
	if (typeof window === 'undefined') return DEFAULT_FONT;

	const stored = localStorage.getItem(STORAGE_KEY);
	if (stored === EPdfFont.TimesNewRoman || stored === EPdfFont.Calibri) {
		return stored;
	}
	return DEFAULT_FONT;
}

export function setPdfFontPreference(font: EPdfFont): void {
	if (typeof window === 'undefined') return;
	localStorage.setItem(STORAGE_KEY, font);
}

export function getJsPdfFontName(font: EPdfFont): string {
	switch (font) {
		case EPdfFont.TimesNewRoman:
			return 'times';
		case EPdfFont.Calibri:
		default:
			return 'helvetica';
	}
}
