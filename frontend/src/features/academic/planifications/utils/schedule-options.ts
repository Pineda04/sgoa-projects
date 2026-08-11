export const DAY_OPTIONS = [
	'Lu',
	'Ma',
	'Mi',
	'Ju',
	'Vi',
	'LuMa',
	'LuMi',
	'LuJu',
	'LuVi',
	'MaMi',
	'MaJu',
	'MaVi',
	'MiJu',
	'MiVi',
	'JuVi',
	'LuMaMi',
	'LuMaJu',
	'LuMaVi',
	'LuMiJu',
	'LuMiVi',
	'LuJuVi',
	'MaMiJu',
	'MaMiVi',
	'MaJuVi',
	'MiJuVi',
	'LuMaMiJu',
	'LuMaMiVi',
	'LuMaJuVi',
	'LuMiJuVi',
	'MaMiJuVi',
	'LuMaMiJuVi',
];

export const TIME_OPTIONS = Array.from({ length: 16 }, (_, index) => {
	const hour = index + 6;
	return `${String(hour).padStart(2, '0')}:00`;
});
