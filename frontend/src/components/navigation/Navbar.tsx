import { Button } from '@components/ui/button';
import { useContext, useState } from 'react';
import '../../App.css';
import { UserMenu } from './UserMenu';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import LogoUNAH from '../../assets/Logo-unah-2.png';
import { Link } from 'react-router-dom';
import { AuthContext } from '@providers/auth';

const ROLES = {
	ADMIN: 'ADMIN',
	DIRECCION: 'DIRECCION',
	RRHH: 'RRHH',
	COORDINADOR_AREA: 'COORDINADOR_AREA',
	DOCENTE: 'DOCENTE',
};

interface MenuItemConfig {
	id: string;
	label: string;
	path: string;
	allowedRoles: string[];
	className?: string;
}

const MENU_ITEMS: MenuItemConfig[] = [
	{
		id: 'inicio',
		label: 'Docencia',
		path: '/docentes/dashboard',
		allowedRoles: [ROLES.DOCENTE],
	},
	{
		id: 'dashboard-coordinador',
		label: 'Coordinación',
		path: '/coordinadores/dashboard-coordinador',
		allowedRoles: [ROLES.ADMIN, ROLES.COORDINADOR_AREA],
	},
	{
		id: 'dashboard-autoridades',
		label: 'Autoridades',
		path: '/autoridades/dashboard-autoridad',
		allowedRoles: [ROLES.ADMIN, ROLES.DIRECCION],
	},
	{
		id: 'autoridades-clases',
		label: 'Clases',
		path: '/autoridades/clases',
		allowedRoles: [ROLES.ADMIN, ROLES.DIRECCION],
	},
	{
		id: 'dashboard-rrhh',
		label: 'Gestión de Usuarios',
		path: '/rrhh/gestion-usuarios',
		allowedRoles: [ROLES.ADMIN, ROLES.RRHH],
	},
	{
		id: 'rrhh-clases',
		label: 'Clases',
		path: '/rrhh/clases',
		allowedRoles: [ROLES.RRHH],
	},
	{
		id: 'ayuda',
		label: 'Ayuda',
		path: '/otros/ayuda',
		allowedRoles: [
			ROLES.ADMIN,
			ROLES.DIRECCION,
			ROLES.RRHH,
			ROLES.COORDINADOR_AREA,
			ROLES.DOCENTE,
		],
	},
];

export const Navbar = () => {
	const [isOpen, setIsOpen] = useState<boolean>(false);
	const {
		authState: { user, isAuthenticated, isLoading },
	} = useContext(AuthContext);

	const hasAnyRole = (allowedRoles: string[]): boolean => {
		if (!user?.roles) return false;
		if (!Array.isArray(user.roles)) return false;
		return user.roles.some(role => allowedRoles.includes(role));
	};

	const getVisibleMenuItems = (): MenuItemConfig[] => {
		return MENU_ITEMS.filter(item => hasAnyRole(item.allowedRoles));
	};

	const onToggleMenu = () => {
		setIsOpen(!isOpen);
	};

	if (isLoading) {
		return (
			<nav className="flex w-full px-3 md:px-8 py-2 md:py-3 items-center justify-between Navbar-style sticky top-0 z-50">
				<Link
					to={'/home/home'}
					className="flex items-center gap-2 md:gap-3"
				>
					<img
						src={LogoUNAH}
						alt="Logo-UNAH"
						className="w-7 h-9 md:w-8 md:h-10 object-contain"
					/>
					<span className="font-display text-lg md:text-xl text-white tracking-wide">
						SPI
					</span>
				</Link>
				<div className="text-white/60 text-xs md:text-sm animate-pulse">
					Cargando...
				</div>
			</nav>
		);
	}

	const visibleMenuItems = getVisibleMenuItems();

	return (
		<nav className="flex w-full px-3 md:px-8 py-2 md:py-3 items-center justify-between Navbar-style sticky top-0 z-50 shadow-lg shadow-primary/20">
			<Link
				to={'/home/home'}
				className="flex items-center gap-2 md:gap-3 group"
			>
				<img
					src={LogoUNAH}
					alt="Logo-UNAH"
					className="w-7 h-9 md:w-8 md:h-10 object-contain transition-transform duration-300 group-hover:scale-105"
				/>
				<span className="font-display text-lg md:text-xl text-white tracking-wide hidden sm:block">
					SPI UNAH
				</span>
			</Link>

			{isAuthenticated && visibleMenuItems.length > 0 && (
				<>
					<div className="hidden md:flex items-center gap-1">
						{visibleMenuItems.map(item => (
							<Link
								key={item.id}
								to={item.path}
								className={`px-3 lg:px-4 py-2 text-sm font-medium text-white/80 rounded-lg 
									transition-all duration-200 hover:bg-white/10 hover:text-white 
									hover:shadow-md ${item.className || ''}`}
							>
								{item.label}
							</Link>
						))}
					</div>

					<div
						className={`fixed md:hidden inset-0 top-[50px] sm:top-[56px] bg-primary/98 backdrop-blur-lg 
							flex flex-col items-center justify-center gap-6 sm:gap-8 transition-all duration-300 z-40
							${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
					>
						{visibleMenuItems.map(item => (
							<Link
								key={item.id}
								to={item.path}
								onClick={() => setIsOpen(false)}
								className="text-lg sm:text-xl font-medium text-white/90 hover:text-white 
									transition-colors duration-200"
							>
								{item.label}
							</Link>
						))}
					</div>
				</>
			)}

			<div className="flex items-center gap-2 md:gap-3">
				{isAuthenticated && <UserMenu />}

				{isAuthenticated && visibleMenuItems.length > 0 && (
					<Button
						onClick={onToggleMenu}
						className="md:hidden p-1.5 sm:p-2 hover:bg-white/10 text-white"
						variant="ghost"
						size="icon"
					>
						{isOpen ? (
							<XMarkIcon className="w-5 h-5 sm:w-6 sm:h-6" />
						) : (
							<Bars3Icon className="w-5 h-5 sm:w-6 sm:h-6" />
						)}
					</Button>
				)}

				{!isAuthenticated && (
					<Link to="/login">
						<Button
							variant="accent"
							size="sm"
							className="bg-accent text-gray-800 font-medium hover:bg-accent-hover text-xs sm:text-sm"
						>
							Iniciar Sesión
						</Button>
					</Link>
				)}
			</div>
		</nav>
	);
};
