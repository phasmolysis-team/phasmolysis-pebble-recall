/** @jsxImportSource preact */
import { useMemo, useState } from "react";
import {Calendar} from './calendar.tsx'

type LogEntry = {
  id: number;
  timestamp: number;
  mood: number;   // horizontal bar value (0-100)
  energy: number; // vertical bar value (0-100)
};

type RGB = {
  r: number;
  g: number;
  b: number;
};

export function PebbleLogListScreen() {
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );

  // Example logs
  const [logs] = useState<LogEntry[]>([
    {
      id: 1,
      timestamp: new Date(`${selectedDate}T08:15:00`).getTime(),
      mood: 10,
      energy: 20,
    },
    {
      id: 2,
      timestamp: new Date(`${selectedDate}T11:42:00`).getTime(),
      mood: 50,
      energy: 80,
    },
    {
      id: 3,
      timestamp: new Date(`${selectedDate}T16:05:00`).getTime(),
      mood: 90,
      energy: 55,
    },
    {
      id: 4,
      timestamp: new Date(`${selectedDate}T21:18:00`).getTime(),
      mood: 70,
      energy: 95,
    },
  ]);

  // -----------------------------------
  // Filter logs for selected day
  // -----------------------------------
  const dayLogs = useMemo(() => {
    return logs.filter((log) => {
      const d = new Date(log.timestamp);
      const day = d.toISOString().split("T")[0];
      return day === selectedDate;
    });
  }, [logs, selectedDate]);

  return (
   <>
   {calendarOpen && (
    <Calendar/>
   )}
    <div style={styles.page}>
      {/* Top Bar */}
      <div style={styles.topBar}>
        {/* Date */}
        <div style={styles.dateText}>
          {formatDate(selectedDate)}
        </div>

        {/* Calendar Picker */}

          <button onClick={()=> setCalendarOpen(true)} style = {styles.calendarButton}
          
            value={selectedDate}>
              📅
            </button>
      
      </div>

      {/* Timeline */}
      <div style={styles.timelineContainer}>
        {/* Vertical Line */}
        <div style={styles.timelineLine} />

        {/* Hour Labels */}
        {Array.from({ length: 24 }).map((_, hour) => (
          <div
            key={hour}
            style={{
              ...styles.hourMarker,
              top: `${(hour / 24) * 100}%`,
            }}
          >
            <span style={styles.hourText}>
              {formatHour(hour)}
            </span>
            
          {addTick(hour)}
           
          </div>
        ))}

        {/* Logs */}
        {dayLogs.map((log) => {
          const date = new Date(log.timestamp);

          const minutes =
            date.getHours() * 60 + date.getMinutes();

          const topPercent = (minutes / 1440) * 100;

          const color = interpolateGradient(log.mood, [
            {
              stop: 0,
              color: { r: 31, g: 154, b: 194 },
            },
            {
              stop: 100,
              color: { r: 243, g: 180, b: 56 },
            },
          ]);

          const size = 10 + (log.energy / 100) * 40;

          return (
            <div
              key={log.id}
              title={`${date.toLocaleTimeString()}`}
              style={{
                ...styles.logPoint,
                top: `${topPercent}%`,
                width: `${size}px`,
                height: `${size}px`,
                background: `rgb(${color.r}, ${color.g}, ${color.b})`,
              }}
            />
          );
        })}
      </div>
    </div>
    </>
  );
}

// -----------------------------------
// Helpers
// -----------------------------------
function formatHour(hour: number): string {
  const suffix = hour >= 12 ? "PM" : "AM";

  
  let h = hour % 12;

  if (h === 0) h = 12;

  if (h % 6 != 0 )
    return "";

  

  return `${h}${suffix}`;
}

function addTick(hour: number) {
  if (hour % 6 != 0)
    return
  return <div style={styles.tick} />

}

function formatDate(dateString: string): string {
  const d = new Date(dateString);

  return d.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
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
        r: Math.round(
          lerp(start.color.r, end.color.r, t)
        ),
        g: Math.round(
          lerp(start.color.g, end.color.g, t)
        ),
        b: Math.round(
          lerp(start.color.b, end.color.b, t)
        ),
      };
    }
  }

  return gradient[gradient.length - 1].color;
}

// -----------------------------------
// Styles
// -----------------------------------
const styles: Record<string, any> = {
  
  page: {
    position:"fixed",
    width:"100%",
    height:"100vh",
    background: "white",
    fontFamily: "youngseifRegular",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",

    color: "black",
  },

  topBar: {
    width: "100%",

    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "30px",
    boxSizing: "border-box",
  },

  dateText: {
    fontSize: "32px",
    fontWeight: "bold",
  },

  calendarButton: {
    width: "60px",
    height: "60px",
    borderRadius: "18px",
    background: "white",
    border: "3px solid black",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    fontSize: "28px",
    position: "relative",
    overflow: "hidden",
  },

  timelineContainer: {
    position: "relative",
    width: "300px",
    height: "1400px",
    marginTop: "20px",
    marginBottom: "50px",
  },

  timelineLine: {
    position: "absolute",
    left: "50%",
    transform: "translateX(-50%)",
    width: "6px",
    height: "100%",
    background: "#222",
    borderRadius: "999px",
  },

  hourMarker: {
    position: "absolute",
    left: "50%",
    transform: "translate(-50%, -50%)",
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },

  hourText: {
    position: "absolute",
    right: "30px",
    width: "70px",
    textAlign: "right",
    fontWeight: "bold",
    fontSize: "14px",
  },

  tick: {
    width: "18px",
    height: "3px",
    background: "#222",
    borderRadius: "999px",
  },

  logPoint: {
    position: "absolute",
    left: "50%",
    transform: "translate(-50%, -50%)",
    borderRadius: "999px",


    cursor: "pointer",
    transition:
      "width 0.15s ease, height 0.15s ease",
  },
};