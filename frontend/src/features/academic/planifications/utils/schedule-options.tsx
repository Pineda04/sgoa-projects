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

export const generateTimeOptions = () => {
	const options = [];

	for (let hour = 6; hour <= 20; hour++) {
		let hour12 = hour % 12;
		if (hour12 === 0) hour12 = 12;

		const period = hour < 12 ? 'AM' : 'PM';
		const timeString = `${hour12}:00 ${period}`;

		options.push(
			<option key={hour} value={timeString}>
				{timeString}
			</option>
		);
	}

	return options;
};
