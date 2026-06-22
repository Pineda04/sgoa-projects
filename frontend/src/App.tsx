import './App.css';
import { AppProviders } from './config';
import { AppRouter } from './router';

function App() {
	return (
		<AppProviders>
			<AppRouter />
		</AppProviders>
	);
}

export default App;
