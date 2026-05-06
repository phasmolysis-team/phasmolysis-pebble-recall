import { useRef, useState} from "react";
import addRockIcon from './assets/add_rock_icon.png'
import hamburgerIcon from './assets/hamburger_icon.png'
import logsIcon from './assets/logs_icon.png'
import exportIcon from './assets/export_icon.png'
import rockLogIcon from './assets/rock_log.png'


import './pebble_toss_hud.css'

import { LiveMessagePopup } from "./live_message_popup"

type ThrowHUDProps = {
  returnToPondHUD: () => void,
  receiveEnergyAndThrowRock: (energy: number) => void,
};


export function ThrowHUD({
  returnToPondHUD,
  receiveEnergyAndThrowRock,
}: ThrowHUDProps) {
  const [verticalValue, setVerticalValue] = useState<number>(50);



    
  return (
    <>

      <LiveMessagePopup
        show={true}
        message="How energetic do you feel?"
      />

      <button
        className="topRightXButton_topRight"
        onClick={returnToPondHUD}
      >
        x
      </button>

      <EnergyBar
        verticalValue={verticalValue}
        setVerticalValue={setVerticalValue}
      />

      <button
        id="throwButton"
        className="decision-button"
        onClick={() => receiveEnergyAndThrowRock(verticalValue)}
      >
        throw
      </button>
    </>
  );
}
type EnergyBarProps = {
  verticalValue: number;
  setVerticalValue: (num: number) => void;
};

function EnergyBar({
  verticalValue,
  setVerticalValue,
}: EnergyBarProps) {
   const verticalRef = useRef<HTMLDivElement | null>(null);
   const updateVertical = (clientY: number): void => {
    if (!verticalRef.current) return;

    const rect = verticalRef.current.getBoundingClientRect();

    let percent = ((rect.bottom - clientY) / rect.height) * 100;
    percent = Math.max(0, Math.min(100, percent));

    setVerticalValue(percent);
  };
const startVerticalDrag = (
  e: globalThis.MouseEvent | globalThis.TouchEvent
): void => {
  e.preventDefault();

  const move = (
    event: globalThis.MouseEvent | globalThis.TouchEvent
  ): void => {
    const clientY =
      "touches" in event
        ? event.touches[0].clientY
        : event.clientY;

    updateVertical(clientY);
  };

  const stop = (): void => {
    window.removeEventListener("mousemove", move);
    window.removeEventListener("mouseup", stop);
    window.removeEventListener("touchmove", move);
    window.removeEventListener("touchend", stop);
  };

  window.addEventListener("mousemove", move);
  window.addEventListener("mouseup", stop);
  window.addEventListener("touchmove", move);
  window.addEventListener("touchend", stop);

  const initialClientY =
  "touches" in e
    ? e.touches[0].clientY
    : e.clientY;

updateVertical(initialClientY);
};

  return (
  <div id="throw_hud_section">
        <div style={styles.energyLabel}>Energy Bar</div>

                  <div
            ref={verticalRef}
            style={styles.verticalBar}
            onMouseDown={(e) => startVerticalDrag(e.nativeEvent)}
            onTouchStart={(e) => startVerticalDrag(e.nativeEvent)}>
          <div
            style={{
              ...styles.verticalFill,
              height: `${verticalValue}%`,
            }}
          />
        </div>

      
      </div>
  );

}
type PebbleTossHUDProps = {
  openNewRockMenu: () => void;
  openLogList: () => void;
  openSideEffectJournal: () => void;
};


export function PebbleTossHUD({ openNewRockMenu, openLogList, openSideEffectJournal}: PebbleTossHUDProps) {
  return (
    <>
      <HamburgerMenu openLogList={openLogList} openSideEffectJournal={openSideEffectJournal}/>

      <NewRockButton openNewRockMenu={openNewRockMenu} />
    </>
  );
}



function HamburgerMenu({openLogList = () => {}, openSideEffectJournal = () => {}})
{
    const [open, setOpen] = useState(false);
    return (
      <div style={styles.topRightContainer}>
        <button
          style={styles.hamburgerButton}
          onClick={() => setOpen(!open)}
        >
          <img src={hamburgerIcon} style={{width:"60px", height:"60px"}}></img>
        </button>

        {open && (
          <div style={styles.dropdown}>
            <button onClick={openSideEffectJournal}  style={styles.iconButton}>
              <img src={logsIcon} style={{width:"50px"}} />
               </button>
            <button onClick={openLogList} style={styles.iconButton}>
                  <img src={rockLogIcon} style={{width:"50px", height:"50px"}}/>
            </button>
            <button style={styles.iconButton}>
                <img src={exportIcon} style={{marginTop:"10px", width:"50px", height:"50px"}}/>
            </button>
          </div>
        )}
      </div>
    );
}

function NewRockButton({openNewRockMenu = () => {}})
{
          {/* Bottom Right Floating Icon */}
     return (
     <button
        style={styles.floatingButton}
        onClick={openNewRockMenu}
      ><img src={addRockIcon}
     	 alt="Button Image" style={{width: "120px", height: "120px", background:"transparent"}}></img>
      </button>
     )
}



const styles: Record<string, any> = {


  energyLabel: {
    fontSize: "20px",
    fontWeight: "bold",
   
  },

  verticalBar: {
    width: "50px",
    height: "320px",
    background: "white",
    overflow: "hidden",
    position: "relative",
    cursor: "pointer",
    border: "2px solid black",
    display: "flex",
    marginRight: "25px",
    alignItems: "flex-end",
    touchAction: "none",
    marginLeft: "25px"
  },

  verticalFill: {
    width: "100%",
    background: "black",

    transition: "height 0.5s linear",
  },



  horizontalFill: {
    height: "100%",
    outline: "2px solid black",
    transition: "width 0.5s ease-in-out",
  },


  topRightContainer: {
    position: "fixed",
    height:"auto",
    top: "30px",
    right: "30px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "10px",
    zIndex: "1000",
  },

  hamburgerButton: {
    width: "70px",
    height: "70px",
    borderRadius: "20px",
    border: "none",
    outline: "5px solid black",
    background: "white",
    cursor: "pointer",
    zIndex:"1",

  },

  line: {
    width: "24px",
    height: "3px",
    borderRadius: "2px",
    background: "white",
  },

  dropdown: {
    width: "auto",
    marginTop: "-20px",
    padding: "30px 0 50px",
    background: "white",
    borderRadius: "20px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "20px",
    outline: "5px solid black",
    animation: "fadeIn 0.5s ease",
  },

  iconButton: {
    width: "60px",
    height: "60px",
    borderRadius: "12px",
    border: "none",
    background: "transparent",
    color: "white",
    fontSize: "20px",
    cursor: "pointer",
  },

  floatingButton: {
    position: "fixed",
    right: "30px",
    bottom: "30px",
    width: "130px",
    height: "130px",
    border: "none",
    cursor: "pointer",
     background: "transparent",
  },

};