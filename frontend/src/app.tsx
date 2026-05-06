import { AppProviders } from "./app/providers";
import { DashboardPage } from "./pages/DashboardPage";

export function App() {
	return (
		<AppProviders>
			<DashboardPage />
		</AppProviders>
	);
}
