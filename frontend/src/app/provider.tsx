import { queryClient } from '@lib/tanstack';
import { AuthProvider } from '@providers/auth';
import { UserProvider } from '@providers/user';
import { QueryClientProvider } from '@tanstack/react-query';
import { IChildrenProps } from '@types';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

export const AppProviders = ({ children }: IChildrenProps) => (
	<QueryClientProvider client={queryClient}>
		<AuthProvider>
			<UserProvider>{children}</UserProvider>
		</AuthProvider>

		<ReactQueryDevtools initialIsOpen={false} />
	</QueryClientProvider>
);
