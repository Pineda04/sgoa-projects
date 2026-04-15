import './App.css';
import { AppProviders } from './app/provider';
import { AppRouter } from './app/router';

function App() {
	return (
		<AppProviders>
			<AppRouter />
		</AppProviders>
	);
}

export default App;
