
import {LoginPopup} from "./register.tsx"
import {useAuth} from "./features/auth/hooks/use-auth"

import './app.css'

import { MedicationYesNoPopup } from './medication_yesno.tsx'
import { Pond } from './pond.tsx'

export function App() {

  return (
      <Pond/>
  )

  const auth = useAuth();

  if (auth.user){
  return (
      <Pond/>
  )
}
else
{

    
  return (
    <LoginPopup/>
  )

  }

 
}
