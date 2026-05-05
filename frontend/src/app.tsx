
/** @jsxImportSource preact */

import './app.css'
import {Route, Router} from 'react-router'
import {useState} from 'react'


import { Pond } from './pond.tsx'


function ConfirmBox() {
  return (
    <div style={styles.overlay}>
      <div style={styles.box}>
        <h2 style={styles.text}>Are you sure?</h2>

        <div style={styles.buttonRow}>
          <button
            style={styles.button}
            onClick={() => alert("Yes clicked")}
          >
            Yes
          </button>

          <button
            style={styles.button}
            onClick={() => alert("No clicked")}
          >
            No
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // semi-transparent black
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: "9999",
  },

  box: {
    backgroundColor: "#222",
    padding: "30px",
    borderRadius: "12px",
    minWidth: "300px",
    textAlign: "center",
    boxShadow: "0 0 15px rgba(0,0,0,0.5)",
  },

  text: {
    color: "white",
    marginBottom: "20px",
  },

  buttonRow: {
    display: "flex",
    justifyContent: "center",
    gap: "15px",
  },

  button: {
    padding: "10px 20px",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "16px",
  },
};
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
    <Pond/>
    </>
  )
 
}
