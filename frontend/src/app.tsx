import { AppProviders } from "./app/providers";
import { DashboardPage } from "./pages/DashboardPage";

import './app.css'

import { MedicationYesNoPopup } from './medication_yesno.tsx'


import { Pond } from './pond.tsx'


export function App() {
  return (
    <AppProviders>
    <MedicationYesNoPopup/>
    <Pond/>
    </AppProviders>
  )
 
}
