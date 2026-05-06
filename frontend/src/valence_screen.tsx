import { useRef, useState, useMemo} from "react";
import iconLogo from './assets/logo.png'
import happyIcon from './assets/happy.png'
import sadIcon from './assets/sad.png'
import './valence_screen.css'
type RGB = {
  r: number;
  g: number;
  b: number;
};


type ValenceScreenProps = {
  dismissValenceScreenAndReopenHUD: (value:string) => void;
  goToEnergyBarScreen: (value:string) => void;
  setValenceThrow: (value: number) => void
};

export function ValenceScreen({dismissValenceScreenAndReopenHUD, goToEnergyBarScreen, setValenceThrow}: ValenceScreenProps)
{
   
    const [horizontalValue, setHorizontalValue] = useState<number>(50);
     const horizontalRef = useRef<HTMLDivElement | null>(null);

      const gradient = [
    { stop: 0, color: { r: 31, g: 154, b: 194 } },     // Blue
    { stop: 100, color: { r: 243, g: 180, b: 56 } },   // Yellow
  ];

  const takeValenceAndGoToEnergyBarScreen = () => {
    setValenceThrow(horizontalValue)
    goToEnergyBarScreen("throw")

  }

  // -----------------------------------
  // Interpolate gradient
  // -----------------------------------
  const currentColor = useMemo(() => {
    return interpolateGradient(horizontalValue, gradient);
  }, [horizontalValue]);

  const updateHorizontal = (clientX: number): void => {
  if (!horizontalRef.current) return;

  const rect = horizontalRef.current.getBoundingClientRect();

  let percent =
    ((clientX - rect.left) / rect.width) * 100;

  percent = Math.max(0, Math.min(100, percent));

  setHorizontalValue(percent);
  };

  const startHorizontalDrag = (
    e: MouseEvent | TouchEvent
  ): void => {
    e.preventDefault();

    const move = (event: MouseEvent | TouchEvent): void => {
      const clientX =
        "touches" in event
          ? event.touches[0].clientX
          : event.clientX;

      updateHorizontal(clientX);
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
 
    <div id="valenceBackground" style={styles.valenceBackground}>
        
        <div style={styles.valenceScreen}>
            <button className="topRightXButton" onClick={() => dismissValenceScreenAndReopenHUD("pond")}>x</button>
            
        <p id="valenceText">How are you feeling today?</p>
            {/* Image */}
        <div style={styles.imageWrapper}>
            <img
            src={iconLogo} 
            
            />

            {/* Color Overlay */}
            <div
            style={{
                ...styles.overlay,
                background: `rgb(${currentColor.r}, ${currentColor.g}, ${currentColor.b})`,
            }}
            />
        </div>

        {/* Horizontal Bar */}
        <div style={styles.horizontalSection}>
            <div
            ref={horizontalRef}
            style={styles.horizontalBar}
            onMouseDown={(e) => startHorizontalDrag(e as MouseEvent)}
            onTouchStart={(e) => startHorizontalDrag(e as TouchEvent)}
            >
            <div
                style={{
                ...styles.horizontalFill,
                width: `${horizontalValue}%`,
                }}
            />
                </div>

            
        </div>
        <div id="happyAndSadIcons">
          <img style={{width:"100px"}} src={sadIcon}/>
          <img style={{width:"100px"}} src={happyIcon}/>
        </div>

        <button className="decision-button" onClick={takeValenceAndGoToEnergyBarScreen}>
                next
            </button>

        
        
        </div>
     </div>
    
     
    
  );
}
function interpolateGradient(
  value: number,
  gradient: { stop: number; color: RGB }[]
): RGB {
  for (let i = 0; i < gradient.length - 1; i++) {
    const start = gradient[i];
    const end = gradient[i + 1];

    if (value >= start.stop && value <= end.stop) {
      const range = end.stop - start.stop;
      const t = (value - start.stop) / range;

      return {
        r: Math.round(lerp(start.color.r, end.color.r, t)),
        g: Math.round(lerp(start.color.g, end.color.g, t)),
        b: Math.round(lerp(start.color.b, end.color.b, t)),
      };
    }
  }

  return gradient[gradient.length - 1].color;
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

const styles: Record<string, any> = {


  horizontalSection: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent:"center",
    gap: "14px",
    width: "400px",
  
  },

  horizontalBar: {
    width: "100%",
    height: "50px",
    background: "linear-gradient(90deg,rgba(31, 154, 194, 1) 0%, rgba(243, 180, 56, 1) 100%)",
    overflow: "hidden",
    position: "relative",
    cursor: "pointer",

    touchAction: "none",
  },

  horizontalFill: {
    height: "100%",
    outline: "2px solid black",
    transition: "width 0.5s ease-in-out",
  },

  valenceBackground: {
    backgroundColor:"rgba(0, 0, 0, 0.2)",
    position:"fixed",
    display:"flex",
    width:"100vw",
    flexDirection:"column",
    justifyContent:"center",
    alignItems:"center",

  },

  valenceScreen: {

    display:"flex",
    background:"white",
    minWidth: "0",
    padding:"50px",
    borderRadius: "20px",
    flexDirection:"column",
    justifyContent: "center",
    alignItems: "center",
  },

  

  
  imageWrapper: {
    display: "flex",
    width: "auto",
    height: "200px",
    margin:"40px",
    borderRadius: "24px",
    overflow: "hidden",
  },


  overlay: {
    position: "absolute",
    height:"auto",
    inset: 0,
    mixBlendMode: "color",
    opacity: 0.7,
    pointerEvents: "none",
    transition: "background 0.08s linear",
  },
};