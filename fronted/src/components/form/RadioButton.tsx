interface IRadioButtonProps {
	id: string;
	label: string;
	value: number | string;
	currentValue: number | string;
	onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const RadioButton = ({
	id,
	label,
	value,
	currentValue,
	onChange,
}: IRadioButtonProps) => {
	return (
		<div className="flex items-center">
			{/* <div className="grid place-items-center mt-1"> */}
			<input
				type="radio"
				id={id}
				className="hidden pointer-events-none peer"
				value={value}
				checked={currentValue === value}
				onChange={onChange}
			/>
			{/* <div className="absolute top-1/2 left-1/2 w-2 h-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500 opacity-0 peer-checked:opacity-100" /> */}
			<label
				htmlFor={id}
				className="text-start mt-0.5 ml-1 bg-blue-400 text-white rounded-md px-6 py-2 hover:bg-blue-500 cursor-pointer peer-checked:bg-blue-500"
			>
				{label}
			</label>
			{/* </div> */}
		</div>
	);
};
