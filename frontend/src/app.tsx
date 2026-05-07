import { useAuth } from "./features/auth/hooks/use-auth";
import { LoginPopup } from "./register.tsx";

import "./app.css";

import { Pond } from "./pond.tsx";

export function App() {
	const auth = useAuth();

	if (auth.user) {
		return <Pond />;
	} else {
		return <LoginPopup />;
	}
}
