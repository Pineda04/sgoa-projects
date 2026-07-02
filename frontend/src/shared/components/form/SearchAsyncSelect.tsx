import { useState } from 'react';
import Select, { FormatOptionLabelMeta, SingleValue } from 'react-select';
import { useDebounce } from '@shared/hooks';
import { IOptions } from '@shared/interfaces';

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

	/** Optional preselected option in Select shape: { value, label, data? } */
	defaultOption?: { value: string; label: string; data?: T } | null;
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
	defaultOption = null,
}: IProps<T>) => {
	const [searchTerm, setSearchTerm] = useState('');
	const { debouncedValue: debValue } = useDebounce(searchTerm, 1500);

	const { data, isLoading } = hook(debValue);

	const fetchedOptions =
		debValue!.length < 2
			? []
			: promiseOptions(data?.data, getOptionValue, getOptionLabel);

	const options = defaultOption
		? [defaultOption, ...fetchedOptions.filter(o => o.value !== defaultOption.value)]
		: fetchedOptions;

	const [selected, setSelected] = useState<{
		value: string;
		label: string;
		data: T;
	} | null>(defaultOption ? (defaultOption as any) : null);

	const handleSelect = (
		e: SingleValue<{
			value: string;
			label: string;
			data: T;
		}>
	) => {
		if (!e) return;
		handleChange(e.data);
		setSelected(e as any);
	};

	const handleInputChange = (inputValue: string) => {
		setSearchTerm(inputValue);
		return inputValue;
	};

	return (
    <Select
      styles={{
        control: (baseStyles) => ({ ...baseStyles, cursor: 'text' }),
      }}
			isLoading={isLoading}
			options={options}
			value={selected}
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
