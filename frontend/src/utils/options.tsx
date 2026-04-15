import { TAcademicCommonProps } from '@features/teachers';

export function setOptions<T extends TAcademicCommonProps>(array: Array<T>) {
	return array.map(({ id, name }) => (
		<option key={id} id={id} value={id}>
			{name}
		</option>
	));
}

export const customOptionsReactSelect = (
	label: string,
	otherInfo: string,
	context: 'menu' | 'value' = 'menu'
) => {
	if (context === 'menu')
		return (
			<div className="cursor-pointer">
				<strong>{label}</strong>
				<div className="text-xs text-[#888]">
					{label} - {otherInfo}
				</div>
			</div>
		);

	return label;
};
