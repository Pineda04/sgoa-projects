import { Navbar } from '@components';
import { Outlet } from 'react-router-dom';

// Componentes comunes entre todos las vistas
export const AppLayout = () => {
	return (
		<>
			<Navbar />
			<div
				className="
          min-h-screen
          pt-6 sm:pt-8 lg:pt-10 xl:pt-12
          pb-12 lg:pb-16
        "
			>
				<div
					className="
            mx-auto
            max-w-7xl
            px-4 sm:px-6 lg:px-8
          "
				>
					<Outlet />
				</div>
			</div>
		</>
	);
};
