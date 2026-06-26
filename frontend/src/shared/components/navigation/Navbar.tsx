import '../../../App.css';
import { useState, useRef, useEffect, useMemo } from 'react';
import { UserMenu } from './UserMenu';
import {
	Bars3Icon,
	XMarkIcon,
	ChevronDownIcon,
	ShieldCheckIcon,
	BookOpenIcon,
	WrenchScrewdriverIcon,
	CubeIcon,
	ChartBarSquareIcon,
} from '@heroicons/react/24/outline';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import type { ComponentType, SVGProps } from 'react';
import { useAbility, useAuth } from '@config';
import type { Subjects } from '@config/lib/casl/ability';
import { Button } from '../ui';

interface SectionConfig {
	label: string;
	path: string;
}

interface ModuleConfig {
	id: string;
	label: string;
	icon: ComponentType<SVGProps<SVGSVGElement>>;
	sections: SectionConfig[];
	disabled?: boolean;
}

const MODULES: ModuleConfig[] = [
	{
		id: 'dashboard',
		label: 'Panel de Control',
		icon: ChartBarSquareIcon,
		sections: [],
	},
	{
		id: 'admin',
		label: 'Administración',
		icon: ShieldCheckIcon,
		sections: [
			{
				label: 'Usuarios',
				path: '/admin/users',
			},
			{
				label: 'Departamentos',
				path: '/admin/departments'
			},
		],
	},
	{
		id: 'academic',
		label: 'Gestión Académica',
		icon: BookOpenIcon,
		sections: [
			{
				label: 'Periodos',
				path: '/academic/periods',
			},
			{
				label: 'Asignaturas',
				path: '/academic/courses',
			},
			{
				label: 'Planificaciones',
				path: '/academic/planifications',
			},
			{
				label: 'Informes',
				path: '/academic/reports',
			},
		],
	},
	{
		id: 'infrastructure',
		label: 'Infraestructura',
		icon: WrenchScrewdriverIcon,
		sections: [
			{
				label: 'Centros',
				path: '/infrastructure/centers',
			},
		],
	},
	{
		id: 'inventory',
		label: 'Inventario',
		icon: CubeIcon,
		sections: [],
	},
];

const moduleSubjectMap: Record<string, Subjects> = {
	home: 'home',
	admin: 'users',
	academic: 'courses',
	infrastructure: 'centers',
	inventory: 'pcEquipments',
	help: 'help',
};

const DASHBOARD_CONFIG = [
	{
		subject: 'dashboard-authorities' as const,
		path: '/dashboard/authorities',
		label: 'Autoridades',
	},
	{
		subject: 'dashboard-coordinator' as const,
		path: '/dashboard/coordinator',
		label: 'Coordinación',
	},
	{
		subject: 'dashboard-teacher' as const,
		path: '/dashboard/teacher',
		label: 'Docencia',
	},
];

export const Navbar = () => {
	const [isOpen, setIsOpen] = useState(false);
	const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
	const [mobileExpandedId, setMobileExpandedId] = useState<string | null>(
		null
	);
	const {
		authState: { isAuthenticated, isLoading },
	} = useAuth();
	const navbarRef = useRef<HTMLDivElement>(null);
	const location = useLocation();
	const navigate = useNavigate();
	const ability = useAbility();

	const availableDashboards = useMemo(() => {
		return DASHBOARD_CONFIG.filter(d => ability.can('read', d.subject));
	}, [ability]);

	const dashboardSections: SectionConfig[] = useMemo(
		() => availableDashboards.map(d => ({ label: d.label, path: d.path })),
		[availableDashboards]
	);

	const modulesWithSections = useMemo(
		() =>
			MODULES.map(mod =>
				mod.id === 'dashboard'
					? { ...mod, sections: dashboardSections }
					: mod
			),
		[dashboardSections]
	);

	const visibleModules = useMemo(() => {
		const mods = modulesWithSections.filter(mod => {
			if (!isAuthenticated) return false;
			if (mod.id === 'home' || mod.id === 'dashboard') return true;
			if (mod.id === 'academic' && !ability.can('read', 'academic-module')) return false;
			const subject = moduleSubjectMap[mod.id];
			if (!subject) return false;
			return ability.can('read', subject);
		});
		if (availableDashboards.length === 0) {
			return mods.filter(m => m.id !== 'dashboard');
		}
		return mods;
	}, [isAuthenticated, ability, availableDashboards, modulesWithSections]);

	useEffect(() => {
		const handleClickOutside = (e: MouseEvent) => {
			if (
				navbarRef.current &&
				!navbarRef.current.contains(e.target as Node)
			) {
				setOpenDropdownId(null);
			}
		};
		document.addEventListener('mousedown', handleClickOutside);
		return () =>
			document.removeEventListener('mousedown', handleClickOutside);
	}, []);

	useEffect(() => {
		setOpenDropdownId(null);
		setIsOpen(false);
		setMobileExpandedId(null);
	}, [location.pathname]);

	const handleModuleClick = (moduleId: string) => {
		setOpenDropdownId(prev => (prev === moduleId ? null : moduleId));
	};

	const isModuleActive = (moduleId: string): boolean => {
		const mod = modulesWithSections.find(m => m.id === moduleId);
		if (!mod) return false;
		return mod.sections.some(s =>
			location.pathname.startsWith(s.path.replace(/\/:\w+/g, ''))
		);
	};

	const isSectionActive = (path: string): boolean => {
		const basePath = path.replace(/\/:\w+/g, '');
		return (
			location.pathname === path ||
			location.pathname.startsWith(basePath + '/')
		);
	};

	if (isLoading) {
		return (
			<nav className="flex w-full px-3 md:px-8 py-2 md:py-3 items-center justify-between Navbar-style sticky top-0 z-50">
				<div className="flex items-center gap-2 md:gap-3">
					<span className="font-display text-lg md:text-xl text-white/80 hover:text-white tracking-wide">
						SPI UNAH
					</span>
				</div>
				<div className="text-white/60 text-xs md:text-sm animate-pulse">
					Cargando...
				</div>
			</nav>
		);
	}

	if (!isAuthenticated) {
		return (
			<nav className="flex w-full px-3 md:px-8 py-2 md:py-3 items-center justify-between Navbar-style sticky top-0 z-50">
				<div className="flex items-center gap-2 md:gap-3">
					<span className="font-display text-lg md:text-xl text-white/80 hover:text-white tracking-wide">
						SPI UNAH
					</span>
				</div>
				<Link to="/login">
					<Button
						variant="accent"
						size="sm"
						className="bg-accent text-gray-800 font-medium hover:bg-accent-hover text-xs sm:text-sm"
					>
						Iniciar Sesión
					</Button>
				</Link>
			</nav>
		);
	}

	return (
		<nav
			ref={navbarRef}
			className="flex w-full px-3 md:px-8 py-2 md:py-3 items-center justify-between Navbar-style sticky top-0 z-50 shadow-lg shadow-primary/20"
		>
			<div>
				<Link
					to={'/home'}
					className="flex items-center gap-2 md:gap-3 group"
				>
					<span className="font-display text-lg md:text-xl text-white/80 hover:text-white tracking-wide hidden sm:block">
						SPI UNAH
					</span>
				</Link>
			</div>

			{visibleModules.length > 0 && (
				<>
					<div className="hidden md:flex items-center gap-1">
						{visibleModules.map(mod => (
							<div key={mod.id} className="relative">
								<button
									onClick={() => handleModuleClick(mod.id)}
									className={`
                    flex items-center gap-1.5 px-3 lg:px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200
                    text-white/80 hover:bg-white/10 hover:text-white`}
									disabled={mod.disabled}
								>
									<mod.icon className="size-4 lg:size-5" />
									<span className="hidden lg:inline">
										{mod.label}
									</span>
									{mod.sections.length > 0 && (
										<ChevronDownIcon
											className={`size-3.5 transition-transform duration-200 ${openDropdownId === mod.id
													? 'rotate-180'
													: ''
												}`}
										/>
									)}
								</button>

								{openDropdownId === mod.id &&
									mod.sections.length > 0 && (
										<div
											className="absolute top-full left-0 mt-2 min-w-52 bg-white rounded-xl shadow-2xl border border-gray-100
												py-2 animate-in scale-in origin-top-left overflow-hidden"
										>
											{mod.sections.map(section => (
												<Link
													key={section.path}
													to={section.path}
													onClick={() =>
														setOpenDropdownId(null)
													}
													className={`block px-4 py-2.5 text-sm transition-colors duration-150 border-b border-gray-50 last:border-b-0
													${isSectionActive(
														section.path
													)
															? 'text-primary font-semibold bg-primary/5'
															: 'text-gray-700 hover:bg-gray-50 hover:text-primary'
														}`}
												>
													<div className="flex items-center gap-2">
														<span
															className={`w-1 h-1 rounded-full ${isSectionActive(
																section.path
															)
																	? 'bg-primary'
																	: 'bg-gray-300'
																}`}
														/>
														{section.label}
													</div>
												</Link>
											))}
										</div>
									)}

								{openDropdownId === mod.id && mod.disabled && (
									<div
										className="absolute top-full left-0 mt-2 min-w-40 bg-white rounded-xl shadow-2xl border border-gray-100
										py-4 px-4 animate-in scale-in origin-top-left text-center"
									>
										<span className="text-xs font-medium text-gray-400">
											Próximamente
										</span>
									</div>
								)}
							</div>
						))}
					</div>

					<div
						className={`fixed md:hidden inset-0 top-12.5 sm:top-14 bg-primary/98 backdrop-blur-lg
							flex flex-col items-start justify-start gap-1 transition-all duration-300 z-40 overflow-y-auto
							${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}
					>
						<div className="w-full px-3 py-4 space-y-1">
							{visibleModules.map(mod => (
								<div key={mod.id} className="w-full">
									<button
										onClick={() => {
											if (mod.disabled) return;
											if (mod.sections.length <= 1) {
												if (mod.sections.length === 1) {
													navigate(
														mod.sections[0].path
													);
												}
												setIsOpen(false);
											} else {
												setMobileExpandedId(prev =>
													prev === mod.id
														? null
														: mod.id
												);
											}
										}}
										className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-left transition-all duration-200
												${mod.disabled
												? 'opacity-40'
												: isModuleActive(mod.id)
													? 'bg-white/15'
													: 'hover:bg-white/5'
											}`}
									>
										<mod.icon className="size-5 text-white/70 shrink-0" />
										<span className="text-base font-medium text-white/90 flex-1 text-left">
											{mod.label}
										</span>
										{mod.disabled && (
											<span className="text-[10px] uppercase tracking-wider text-white/30 font-medium">
												Pronto
											</span>
										)}
										{mod.sections.length > 1 && (
											<ChevronDownIcon
												className={`size-4 text-white/50 transition-transform duration-200 shrink-0 ${mobileExpandedId === mod.id
														? 'rotate-180'
														: ''
													}`}
											/>
										)}
									</button>

									{mobileExpandedId === mod.id &&
										mod.sections.length > 1 && (
											<div className="ml-5 mt-1 space-y-0.5 border-l-2 border-white/10 pl-4">
												{mod.sections.map(section => (
													<Link
														key={section.path}
														to={section.path}
														onClick={() =>
															setIsOpen(false)
														}
														className={`block px-4 py-2.5 rounded-lg text-sm transition-colors duration-150
																	${isSectionActive(
															section.path
														)
																? 'text-accent font-medium bg-white/10'
																: 'text-white/70 hover:text-white hover:bg-white/5'
															}`}
													>
														{section.label}
													</Link>
												))}
											</div>
										)}
								</div>
							))}
						</div>
					</div>
				</>
			)}

			<div className="flex lg:items-center lg:w-auto justify-between w-full gap-2 md:gap-3">
				{visibleModules.length > 0 && (
					<Button
						onClick={() => {
							setIsOpen(!isOpen);
							setMobileExpandedId(null);
						}}
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

				<UserMenu />
			</div>
		</nav>
	);
};
