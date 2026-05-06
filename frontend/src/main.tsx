import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { App } from "./app.tsx";
import { AppProviders } from "./app/providers";
const rootElement = document.getElementById("app");

if (!rootElement) {
	throw new Error("Root element #app was not found");
}

createRoot(rootElement).render(
	
	<StrictMode>
		<AppProviders>
		<App/>
		</AppProviders>
	</StrictMode>,

);
