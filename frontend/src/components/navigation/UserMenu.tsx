import { Button } from '@components/ui/button';
import { useState, useEffect, useRef, useContext } from 'react';
import {
	UserCircleIcon,
	LockClosedIcon,
	ArrowLeftStartOnRectangleIcon,
} from '@heroicons/react/24/outline';
import '../../App.css';
import { useNavigate } from 'react-router-dom';
import { useAuth, AuthContext } from '@providers/auth';
import { useModal } from '@hooks';
import { ModalBase } from '@components/ui';
import { UpdatePasswordLogged } from '@features/shared/users';
import { User } from 'lucide-react';
import { useUser } from '@providers/user';

export const UserMenu = () => {
	const [isOpen, setIsOpen] = useState(false);
	const handleToggle = () => setIsOpen(!isOpen);

	const searchRef = useRef<HTMLDivElement>(null);

	const {
		authState: { user },
	} = useAuth();

	const { user: userInfo } = useUser();

	const navigate = useNavigate();

	const { logout } = useContext(AuthContext);

	const [
		showModalUpdatePassword,
		handleShowModalUpdatePassword,
		handleCloseModalUpdatePassword,
	] = useModal();

	//Handle cuando se da click fuera del contexto del menu de busqueda
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
		setIsOpen(prev => !prev);

		navigate('/usuarios/perfil', { replace: true });
	};

	return (
		<>
			<div ref={searchRef} className="relative z-30">
				{/* Boton de activacion del menu */}
				<Button
					onClick={handleToggle}
					className="p-1 bg-white hover:bg-[#80C5E9] transition-all duration-500 ease-in-out cursor-pointer rounded-full"
					variant="unstyled"
				>
					<UserCircleIcon className="size-6 text-black" />
				</Button>

				{/*Menu lateral*/}
				<div
					className={`
          top-[55px] w-full fixed md:top-[55px] right-0 h-full md:w-[35%] bg-white shadow-md p-4 border-t border-gray-200 transition-all duration-300 ease-in-out
          ${
				isOpen
					? 'translate-x-0 opacity-100'
					: 'translate-x-full opacity-0 pointer-events-none'
			}
        `}
				>
					{/*Opciones del menu de usuario*/}
					<ul className="flex flex-col items-center w-full text-black">
						<li className="mb-2">
							<h5>{user?.email}</h5>
						</li>

						<li className="p-2 hover:bg-gray-300 rounded-lg w-full transition-all duration-500 ease-in-out">
							<Button
								onClick={handleProfile}
								className={`flex items-center gap-2 w-full ${!userInfo ? 'cursor-not-allowed' : 'cursor-pointer'}`}
								disabled={!userInfo}
								variant="unstyled"
							>
								<User className="size-5" />
								<h5>Ver Perfil</h5>
							</Button>
						</li>
						<li className="p-2 hover:bg-gray-300 rounded-lg w-full transition-all duration-500 ease-in-out">
							<Button
								onClick={handleChangePassword}
								className="flex items-center gap-2 w-full cursor-pointer"
								variant="unstyled"
							>
								<LockClosedIcon className="size-5" />
								<h5>Cambio de contraseña</h5>
							</Button>
						</li>
						<li className="p-2 hover:bg-gray-300 rounded-lg w-full transition-all duration-500 ease-in-out">
							<Button
								onClick={handleLogOut}
								className="flex items-center gap-2 w-full cursor-pointer"
								variant="unstyled"
							>
								<ArrowLeftStartOnRectangleIcon className="size-5" />
								<h5>Cerrar sesion</h5>
							</Button>
						</li>
					</ul>
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
