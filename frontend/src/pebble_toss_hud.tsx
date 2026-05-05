import { useRef, useState} from "preact/hooks";
import addRockIcon from './assets/add_rock_icon.png'
import hamburgerIcon from './assets/hamburger_icon.png'
import logsIcon from './assets/logs_icon.png'
import exportIcon from './assets/export_icon.png'
import './pebble_toss_hud.css'


export function EnergyBar() {
  const [verticalValue, setVerticalValue] = useState<number>(60);
   const verticalRef = useRef<HTMLDivElement | null>(null);
   const updateVertical = (clientY: number): void => {
    if (!verticalRef.current) return;

    const rect = verticalRef.current.getBoundingClientRect();

    let percent = ((rect.bottom - clientY) / rect.height) * 100;
    percent = Math.max(0, Math.min(100, percent));

    setVerticalValue(percent);
  };
  const startVerticalDrag = (
    e: MouseEvent | TouchEvent
  ): void => {
    e.preventDefault();

    const move = (event: MouseEvent | TouchEvent): void => {
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

    move(e);
  };

  return (
  <div style={styles.section}>
        <div style={styles.energyLabel}>Energy Bar</div>

        <div
          ref={verticalRef}
          style={styles.verticalBar}
          onMouseDown={(e) => startVerticalDrag(e as MouseEvent)}
          onTouchStart={(e) => startVerticalDrag(e as TouchEvent)}
        >
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
};
export function PebbleTossHUD({ openNewRockMenu }: PebbleTossHUDProps) {
  return (
    <>
      <HamburgerMenu />

      <NewRockButton openNewRockMenu={openNewRockMenu} />
    </>
  );
}

function HamburgerMenu()
{
    const [open, setOpen] = useState(false);
    return (
      <div style={styles.topRightContainer}>
        <button
          style={styles.hamburgerButton}
          onClick={() => setOpen(!open)}
        >
          <img src={hamburgerIcon} style="width:60px; height:60px;"></img>
        </button>

        {open && (
          <div style={styles.dropdown}>
            <button style={styles.iconButton}>
                <img src={logsIcon} style="width:50px; height:50px;"></img>
            </button>
            <button style={styles.iconButton}>
                <img src={exportIcon} style="width:50px; height:50px;"></img>
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
     	 alt="Button Image" style="width: 120px; height: 120px;"></img>
      </button>
     )
}



const styles: Record<string, any> = {


  section: {
    display: "flex",
    position:"fixed",
    right: "50px",
    bottom: "100px",
    flexDirection: "column",
    alignItems: "center",
    gap: "14px",
  },

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
    zIndex: 1000,
  },

  hamburgerButton: {
    width: "70px",
    height: "70px",
    borderRadius: "20px",
    border: "none",
    outline: "5px solid black",
    background: "white",
    cursor: "pointer",

  },

  line: {
    width: "24px",
    height: "3px",
    borderRadius: "2px",
    background: "white",
  },

  dropdown: {
    width: "80px",
    padding: "30px 0 30px",
    background: "white",
    borderRadius: "20px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "10px",
    outline: "5px solid black",
    animation: "fadeIn 0.2s ease",
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