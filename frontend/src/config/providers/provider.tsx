import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { IChildrenProps } from '@shared';
import { AbilityProvider, queryClient } from '../lib';
import { AuthProvider } from './auth';
import { UserProvider } from './user';

export const AppProviders = ({ children }: IChildrenProps) => (
	<QueryClientProvider client={queryClient}>
		<AuthProvider>
			<AbilityProvider>
				<UserProvider>{children}</UserProvider>
			</AbilityProvider>
		</AuthProvider>

		<ReactQueryDevtools initialIsOpen={false} />
	</QueryClientProvider>
);
