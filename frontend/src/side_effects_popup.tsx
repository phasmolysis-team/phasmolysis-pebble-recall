import { useState } from "react";
import type { CSSProperties } from "react";

type EntryData = {
  text: string;
  mood: string;
};

type SavedData = {
  [date: string]: EntryData;
};

export function SideEffectsJournalPopup({dismissScreenAndReopenHUD = () => {}}) {
  const [savedData, setSavedData] = useState<SavedData>({
    "2026-05-01": {
      text: "Went jogging today.",
      mood: "Happy",
    },
  });

  const today = new Date().toISOString().split("T")[0];

  const [selectedDate, setSelectedDate] =
    useState<string>(today);

  const [text, setText] = useState<string>("");

  const [dropdownValue, setDropdownValue] =
    useState<string>("Happy");

  const [showSavedPopup, setShowSavedPopup] =
    useState<boolean>(false);

  function handleDateChange(date: string): void {
    setSelectedDate(date);

    const existing = savedData[date];

    if (existing) {
      setText(existing.text);
      setDropdownValue(existing.mood);
    } else {
      setText("");
      setDropdownValue("Happy");
    }
  }

  function handleSave(): void {
    setSavedData((prev) => ({
      ...prev,
      [selectedDate]: {
        text,
        mood: dropdownValue,
      },
    }));

    setShowSavedPopup(true);

    setTimeout(() => {
      setShowSavedPopup(false);
    }, 2000);
  }

  return (
    <>
      <div style={styles.overlay}>
        <button class="topRightXButton" onClick={dismissScreenAndReopenHUD}>x</button>
        <div style={styles.popup} class="box">
          <h1 style={styles.title}>Side Effects Journal</h1>

          {/* Date */}
          <label style={styles.label}>Select Date</label>

          <input
            type="date"
            value={selectedDate}
            max={today}
            onInput={(e) => {
              const target =
                e.currentTarget as HTMLInputElement;

              handleDateChange(target.value);
            }}
            style={styles.input}
          />

          {/* Text */}
          <label style={styles.label}>
           List Side Effects Experienced
          </label>

          <textarea
            value={text}
            onInput={(e) => {
              const target =
                e.currentTarget as HTMLTextAreaElement;

              setText(target.value);
            }}
            placeholder="Write something..."
            style={styles.textarea}
          />

          {/* Dropdown */}
          <label style={styles.label}>Medication</label>

          <select
            value={dropdownValue}
            onInput={(e) => {
              const target =
                e.currentTarget as HTMLSelectElement;

              setDropdownValue(target.value);
            }}
            style={styles.input}
          >
            <option value="Happy">Happy</option>
            <option value="Neutral">Neutral</option>
            <option value="Sad">Sad</option>
            <option value="Excited">Excited</option>
            <option value="Tired">Tired</option>
          </select>

          {/* Save */}
          <button
            style={styles.saveButton}
            onClick={handleSave}
          >
            Save
          </button>
        </div>
      </div>

      {/* Confirmation Popup */}
      {showSavedPopup && (
        <div class="liveMessageOverlay">
          <div>
            Saved successfully!
          </div>
        </div>
      )}
    </>
  );
}

const styles: Record<string, CSSProperties> = {
  
  overlay: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },


  xButton: {
    position:"absolute",
    top:"50px",
    right: "10%",
    fontSize : "30px",
    color:"black",
    border:"5px solid black",
    borderRadius: "100px",
    padding:"0",
    width:"60px",
    height:"60px",
    fontWeight:"bold",
    background:"white",
    cursor:"pointer",
  },

  popup: {
    width: "600px",
    maxWidth: "90%",
    borderRadius: "16px",
    padding: "30px",
    display: "flex",
    flexDirection: "column",
    gap: "15px",
    boxShadow: "0 0 20px rgba(0,0,0,0.5)",
  },

  title: {
    margin: 0,
    marginBottom: "10px",
    textAlign: "center",
  },

  label: {
    fontSize: "14px",
    fontWeight: "bold",
  },

  input: {
    padding: "10px",
    background: "transparent",
    outline: "2px solid black",
    color: "black",
    fontSize: "16px",
    fontFamily: "youngseifRegular"
  },

  textarea: {
    minHeight: "150px",
    resize: "vertical",
    padding: "10px",
    outline: "2px solid black",
    background: "transparent",
    border: "none",
    color: "black",
    fontSize: "16px",
  },

  saveButton: {
    marginTop: "10px",
    padding: "12px",
    border: "none",
    borderRadius: "10px",
    backgroundColor: "black",
    fontFamily: "youngseifRegular",
    color: "white",
    fontSize: "16px",
    cursor: "pointer",
  },



  
};