import { Button } from '@shared';
import '../../../../App.css';
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';

export const Help = () => {
	return (
		<>
			<div className="bg-[#F0F0F0] shadow-md rounded-xl mt-10 mx-[10%] md:mx-[30%] p-6 flex flex-col items-center justify-center text-center">
				<h1 className="text-xl font-semibold mb-4">
					Descargar el manual de usuario
				</h1>
				<Button
					className="bg-[#C40C54] hover:bg-[#FCC40C] hover:text-black text-white px-4 py-2 transition flex flex-row gap-2 duration-500"
					variant="unstyled"
					size="default"
				>
					<ArrowDownTrayIcon className="size-6" />
					Manual de usuario
				</Button>
			</div>
		</>
	);
};
