import { useState } from 'react';
import Select, { FormatOptionLabelMeta, SingleValue } from 'react-select';
import { IOptions } from '@types';
import { useDebounce } from '@hooks';

interface IProps<T> {
	hook: (
		st: string,
		page?: number,
		size?: number
	) => { data?: { data: T[] }; isLoading: boolean };
	handleChange: (data: T) => void;
	getOptionValue: (item: T) => string;
	getOptionLabel: (item: T) => string;
	formatOptionLabel?:
		| ((
				data: IOptions<T>,
				formatOptionLabelMeta: FormatOptionLabelMeta<IOptions<T>>
		  ) => React.ReactNode)
		| undefined;
}

const promiseOptions = <T,>(
	data: T[] | undefined,
	getOptionValue: (item: T) => string,
	getOptionLabel: (item: T) => string
) => {
	return (
		data?.map(el => ({
			value: getOptionValue(el),
			label: getOptionLabel(el),
			data: el as T,
		})) ?? []
	);
};

export const SearchAsyncSelect = <T,>({
	hook,
	handleChange,
	getOptionLabel,
	getOptionValue,
	formatOptionLabel,
}: IProps<T>) => {
	const [searchTerm, setSearchTerm] = useState('');
	const { debouncedValue: debValue } = useDebounce(searchTerm, 1500);

	const { data, isLoading } = hook(debValue);
	// const [options, setOptions] = useState<IOptions<T>[]>([]);

	// useEffect(() => {
	// 	if (debValue!.length < 2) return;
	// 	setOptions(promiseOptions(data?.data, getOptionValue, getOptionLabel));
	// }, [data, debValue]);

	const options =
		debValue!.length < 2
			? []
			: promiseOptions(data?.data, getOptionValue, getOptionLabel);

	const handleSelect = (
		e: SingleValue<{
			value: string;
			label: string;
			data: T;
		}>
	) => {
		if (!e) return;
		handleChange(e.data);
	};

	const handleInputChange = (inputValue: string) => {
		setSearchTerm(inputValue);
		return inputValue;
	};

	return (
		<Select
			isLoading={isLoading}
			options={options}
			inputValue={searchTerm}
			onInputChange={handleInputChange}
			formatOptionLabel={formatOptionLabel}
			onChange={handleSelect}
			loadingMessage={() => 'Cargando...'}
			noOptionsMessage={() =>
				// 'Ingrese al menos 2 caracteres para la búsqueda...'
				'No se obtuvieron resultados.'
			}
			placeholder="Buscar..."
			filterOption={() => true}
		/>
	);
};
