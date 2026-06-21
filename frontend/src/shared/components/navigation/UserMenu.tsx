import '../../../App.css';
import { useState, useEffect, useRef, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UpdatePasswordLogged } from '@features/admin/users';
import { User } from 'lucide-react';
import {
	LockClosedIcon,
	ArrowLeftStartOnRectangleIcon,
	XMarkIcon,
} from '@heroicons/react/24/outline';
import { AuthContext, useAuth, useUser } from '@config/providers';
import { useModal } from '@shared/hooks';
import { Button, ModalBase } from '../ui';

export const UserMenu = () => {
	const navigate = useNavigate();
	const searchRef = useRef<HTMLDivElement>(null);
	const handleToggle = () => setIsOpen(!isOpen);
	const [isOpen, setIsOpen] = useState(false);
	const { authState: { user } } = useAuth();
	const { user: userInfo } = useUser();
	const { logout } = useContext(AuthContext);
	const [
		showModalUpdatePassword,
		handleShowModalUpdatePassword,
		handleCloseModalUpdatePassword,
	] = useModal();

	useEffect(() => {
		const handleClickOutside = (e: MouseEvent) => {
			if (
				searchRef.current &&
				!searchRef.current.contains(e.target as Node)
			) {
				setIsOpen(false);
			}
		};
		document.addEventListener('mousedown', handleClickOutside);
		return () =>
			document.removeEventListener('mousedown', handleClickOutside);
	}, []);

	const handleLogOut = () => {
		logout();
		navigate('/', { replace: true });
	};

	const handleChangePassword = () => {
		handleShowModalUpdatePassword();
	};

	const handleProfile = () => {
		setIsOpen(false);
		navigate('/admin/users/profile', { replace: true });
	};

	const getInitials = (name?: string) => {
		if (!name) return 'U';
		return name
			.split(' ')
			.map(n => n[0])
			.join('')
			.toUpperCase()
			.slice(0, 2);
	};

	return (
		<>
			<div ref={searchRef} className="relative z-30">
				<Button onClick={handleToggle} variant="unstyled">
					<div className="size-8 rounded-full bg-white/20 hover:bg-white/30 transition-all duration-300 cursor-pointer flex items-center justify-center">
						<span className="text-xs font-bold text-white/80">
							{getInitials(userInfo?.name || user?.email)}
						</span>
					</div>
				</Button>

				<div
					className={`
						fixed top-0 right-0 h-full w-full sm:w-80 bg-white shadow-2xl
						transition-all duration-300 ease-out
						${isOpen ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0 pointer-events-none'}
					`}
				>
					<div className="flex flex-col h-full">
						<div className="bg-linear-to-b from-primary to-primary-hover px-6 pt-8 pb-6">
							<div className="flex items-center justify-between mb-6">
								<span className="text-sm font-medium text-white/60 uppercase tracking-wider">
									Menú de usuario
								</span>
								<button
									onClick={() => setIsOpen(false)}
									className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-all duration-200 cursor-pointer"
								>
									<XMarkIcon className="size-5" />
								</button>
							</div>

							<div className="flex items-center gap-4">
								<div className="size-14 rounded-full bg-white/20 flex items-center justify-center ring-2 ring-white/40">
									<span className="text-xl font-bold text-white">
										{getInitials(
											userInfo?.name || user?.email
										)}
									</span>
								</div>
								<div className="flex-1 min-w-0">
									<h3 className="text-white font-semibold text-base truncate">
										{userInfo?.name
											? `${userInfo.name}`
											: 'Usuario'}
									</h3>
									<p className="text-white/60 text-sm truncate mt-0.5">
										{user?.email}
									</p>
								</div>
							</div>
						</div>

						<div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
							<button
								onClick={handleProfile}
								disabled={!userInfo}
								className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-left transition-all duration-200
									${
										!userInfo
											? 'opacity-50 cursor-not-allowed text-gray-400'
											: 'text-gray-700 hover:bg-gray-100 hover:text-primary cursor-pointer'
									}`}
							>
								<div
									className={`size-9 rounded-lg flex items-center justify-center
									${userInfo ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-400'}`}
								>
									<User className="size-4.5" />
								</div>
								<div>
									<p className="text-sm font-medium">
										Ver Perfil
									</p>
									<p className="text-xs text-gray-400 mt-0.5">
										Tus datos personales
									</p>
								</div>
							</button>

							<button
								onClick={handleChangePassword}
								className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-left text-gray-700 hover:bg-gray-100 hover:text-primary transition-all duration-200 cursor-pointer"
							>
								<div className="size-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
									<LockClosedIcon className="size-4.5" />
								</div>
								<div>
									<p className="text-sm font-medium">
										Cambiar contraseña
									</p>
									<p className="text-xs text-gray-400 mt-0.5">
										Actualiza tu clave de acceso
									</p>
								</div>
							</button>
						</div>

						<div className="px-3 py-3 border-t border-gray-100">
							<button
								onClick={handleLogOut}
								className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-left text-red-600 hover:bg-red-50 transition-all duration-200 cursor-pointer"
							>
								<div className="size-9 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
									<ArrowLeftStartOnRectangleIcon className="size-4.5" />
								</div>
								<div>
									<p className="text-sm font-medium">
										Cerrar sesión
									</p>
									<p className="text-xs text-red-400 mt-0.5">
										Salir de tu cuenta
									</p>
								</div>
							</button>
						</div>
					</div>
				</div>
			</div>
			<ModalBase
				isOpen={showModalUpdatePassword}
				onClose={handleCloseModalUpdatePassword}
			>
				<UpdatePasswordLogged
					onCancel={handleCloseModalUpdatePassword}
				/>
			</ModalBase>
		</>
	);
};
