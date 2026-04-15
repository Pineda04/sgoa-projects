export const Error = ({
	error,
	className = 'text-red-700',
	breakLine = true,
}: {
	error: string;
	className?: string;
	breakLine?: boolean;
}) => {
	return (
		<>
			{breakLine && <br />}
			<span className={`text-sm font-light ${className}`}>{error}</span>
		</>
	);
};
