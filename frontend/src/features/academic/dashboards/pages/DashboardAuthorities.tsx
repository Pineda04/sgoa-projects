import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useTabWithReset } from '@shared/hooks';
import { Button, IResponsiveColumn, ResponsiveTable, Tabs, TabsContent, TabsList, TabsTrigger } from '@shared/components';

interface FileData {
	id: string;
	name: string;
}

interface UserData {
	id: string;
	code: string;
	name: string;
	undergrad: string;
	postgrad: string;
	category: string;
	contract: string;
	otherData: string;
}

export const DashboardAuthorities = () => {
	const [searchReport, setSearchReport] = useState('');
	const [searchUser, setSearchUser] = useState('');
	const validTabs = ['0', '1'];
	const { currentTab, setTab } = useTabWithReset(validTabs);

	const reportColumns: IResponsiveColumn<FileData>[] = [
		{ key: 'name', header: 'Nombre del archivo', mobileLabel: 'Archivo' },
		{ key: 'view', header: 'Ver contenido', mobileLabel: 'Ver' },
		{ key: 'download', header: 'Descargar', mobileLabel: 'Descargar' },
	];

	const userColumns: IResponsiveColumn<UserData>[] = [
		{ key: 'code', header: 'Código', mobileLabel: 'Cod.' },
		{ key: 'name', header: 'Nombre', mobileLabel: 'Nombre' },
		{ key: 'undergrad', header: 'Pregrado', mobileLabel: 'Pregrado', hiddenOnMobile: true },
		{ key: 'postgrad', header: 'Posgrado', mobileLabel: 'Posgrado', hiddenOnMobile: true },
		{ key: 'category', header: 'Categoría', mobileLabel: 'Categoría', hiddenOnMobile: true },
		{ key: 'contract', header: 'Contratación', mobileLabel: 'Contrato', hiddenOnMobile: true },
		{ key: 'otherData', header: 'Otros datos', mobileLabel: 'Otros', hiddenOnMobile: true },
		{ key: 'actions', header: 'Acciones', mobileLabel: 'Acciones' },
	];

	const emptyReports: FileData[] = [];
	const emptyUsers: UserData[] = [];

	return (
		<>
			<div className="mb-6">
				<h2 className="text-2xl font-semibold">
					UNAH - Campus Copán IIIPAC 2025
				</h2>
				<p className="text-sm">Nombre de Autoridad</p>
				<p className="text-sm">10355</p>
				<p className="text-sm">correo@unah.edu</p>
			</div>

			<Tabs value={currentTab} onValueChange={setTab} className="mt-5">
				<TabsList>
					<TabsTrigger value="0">Informes de docentes</TabsTrigger>
					<TabsTrigger value="1">Gestión de usuarios</TabsTrigger>
				</TabsList>

				<TabsContent value="0">
					<div className="flex justify-center mb-4">
						<input
							type="text"
							placeholder="Buscar informe..."
							value={searchReport}
							onChange={e => setSearchReport(e.target.value)}
							className="border border-gray-300 px-4 py-2 rounded-md w-80 focus:outline-none focus:ring focus:border-blue-300"
						/>
					</div>

					<div className="py-2">
						<ResponsiveTable<FileData>
							columns={reportColumns}
							data={emptyReports}
							getRowKey={f => f.id}
							emptyMessage="No hay informes disponibles"
							showRowNumber={false}
						/>
					</div>
				</TabsContent>

				<TabsContent value="1">
					<div className="flex flex-row gap-10 justify-center mb-5">
						<Button
							type="button"
							className="w-fit justify-center bg-[#5BC85C] text-white p-2 hover:bg-green-300 transition flex flex-row gap-2 duration-500"
							variant="unstyled"
						>
							<Plus className="size-6" />
							Nuevo usuario
						</Button>
					</div>

					<div className="flex justify-center mb-4">
						<input
							type="text"
							placeholder="Buscar usuario..."
							value={searchUser}
							onChange={e => setSearchUser(e.target.value)}
							className="border border-gray-300 px-4 py-2 rounded-xl w-80 focus:outline-none focus:ring focus:border-blue-300"
						/>
					</div>

					<div className="py-2">
						<ResponsiveTable<UserData>
							columns={userColumns}
							data={emptyUsers}
							getRowKey={u => u.id}
							emptyMessage="No hay usuarios disponibles"
							showRowNumber={false}
						/>
					</div>
				</TabsContent>
			</Tabs>
		</>
	);
};
