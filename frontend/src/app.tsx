
/** @jsxImportSource preact */

import './app.css'
import {Route, Router} from 'preact-router'
import {useState} from 'preact/hooks'


import { Pond } from './pond.tsx'


import {Calendar} from './calendar.tsx'

/*

  return (
  <Router>
    
    <Route path="/" component={Pond}/>
    </Router>
      
  )
*/

export function App() {
  const [page, setPage] = useState("menu");
  return (
    <Pond/>
  )
 
}
