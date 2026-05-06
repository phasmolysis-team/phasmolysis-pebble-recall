
/** @jsxImportSource preact */

import './app.css'
import {Route, Router} from 'react-router'
import {useState} from 'react'
import { MedicationYesNoPopup } from './medication_yesno.tsx'


import { Pond } from './pond.tsx'



/*

  return (
  <Router>
    
    <Route path="/" component={Pond}/>
    </Router>
      
  )
*/

export function App() {
  return (
    <>
    <MedicationYesNoPopup/>
    <Pond/>
    </>
  )
 
}
