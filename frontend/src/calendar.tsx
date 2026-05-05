import { useMemo, useState } from "preact/hooks";

type CircleSize = "small" | "big";

type DayInfo = {
  size: CircleSize;
  value: number;
};


const sampleData: Record<number, DayInfo> = {
  2: { size: "small", value: 0.1 },
  5: { size: "big", value: 0.9 },
  8: { size: "small", value: 0.6 },
  12: { size: "big", value: 0.2 },
  16: { size: "small", value: 0.8 },
  21: { size: "big", value: 0.45 },
  26: { size: "small", value: 1.0 },
};

function gradientColor(value: number): string {
  const clamped = Math.max(0, Math.min(1, value));

  const start = {
    r: 255,
    g: 210,
    b: 70,
  };

  const end = {
    r: 60,
    g: 120,
    b: 255,
  };

  const r = Math.round(start.r + (end.r - start.r) * clamped);
  const g = Math.round(start.g + (end.g - start.g) * clamped);
  const b = Math.round(start.b + (end.b - start.b) * clamped);

  return `rgb(${r}, ${g}, ${b})`;
}

export function Calendar() {
  const today = useMemo(() => new Date(), []);

  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const [currentMonth, setCurrentMonth] = useState<number>(
    today.getMonth()
  );

  const [currentYear, setCurrentYear] = useState<number>(
    today.getFullYear()
  );

  function changeMonth(offset: number): void {
    let newMonth = currentMonth + offset;
    let newYear = currentYear;

    if (newMonth < 0) {
      newMonth = 11;
      newYear--;
    }

    if (newMonth > 11) {
      newMonth = 0;
      newYear++;
    }

    setCurrentMonth(newMonth);
    setCurrentYear(newYear);
  }

  function changeYear(offset: number): void {
    setCurrentYear((prev) => prev + offset);
  }

  const firstDay = new Date(currentYear, currentMonth, 1).getDay();

  const totalDays = new Date(
    currentYear,
    currentMonth + 1,
    0
  ).getDate();

  const monthLabel = new Date(
    currentYear,
    currentMonth
  ).toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  const cells: preact.ComponentChildren[] = [];

  // Leading empty cells
  for (let i = 0; i < firstDay; i++) {
    cells.push(
      <div
        class="empty-cell"
        key={`empty-${i}`}
      />
    );
  }

  // Actual day cells
  for (let day = 1; day <= totalDays; day++) {
    const info = sampleData[day];

    const isSelected = selectedDay === day;

    cells.push(
      <div
        key={day}
        class={`day-cell ${
          isSelected ? "selected" : ""
        }`}
        onClick={() => setSelectedDay(day)}
      >
        <div class="day-number">{day}</div>

        {info && (
          <div
            class={`circle ${info.size}`}
            style={{
              background: gradientColor(info.value),
            }}
          />
        )}
      </div>
    );
  }

  return (
    <>
      <style>{styles}</style>

      <div class="calendar-wrapper">
        <div class="calendar-header">
          {/* Year controls */}
          <div class="arrow-group">
            <button
              class="arrow-btn"
              onClick={() => changeYear(-1)}
            >
              «
            </button>

            <button
              class="arrow-btn"
              onClick={() => changeMonth(-1)}
            >
              ‹
            </button>
          </div>

          <div class="header-center">
            {monthLabel}
          </div>

          {/* Month controls */}
          <div class="arrow-group">
            <button
              class="arrow-btn"
              onClick={() => changeMonth(1)}
            >
              ›
            </button>

            <button
              class="arrow-btn"
              onClick={() => changeYear(1)}
            >
              »
            </button>
          </div>
        </div>

        <div class="weekdays">
          <div class="weekday">Sun</div>
          <div class="weekday">Mon</div>
          <div class="weekday">Tue</div>
          <div class="weekday">Wed</div>
          <div class="weekday">Thu</div>
          <div class="weekday">Fri</div>
          <div class="weekday">Sat</div>
        </div>

        {/* Only fills required rows */}
        <div class="calendar-grid">
          {cells}
        </div>
      </div>
    </>
  );
}


const styles = `
  * {
    box-sizing: border-box;
  }

  body {
    margin: 0;
    background: white;
    font-family: Arial, sans-serif;
  }

  .calendar-wrapper {
    position: fixed;
    background: white;
    border-radius: 14px;
    overflow: hidden;
    box-shadow: 0 4px 18px rgba(0,0,0,0.12);
    z-index: 1000;
  }

  .calendar-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 16px;
    background: #1f2937;
    color: white;
  }

  .header-center {
    font-size: 18px;
    font-weight: bold;
  }

  .arrow-group {
    display: flex;
    gap: 6px;
  }

  .arrow-btn {
    border: none;
    background: rgba(255,255,255,0.12);
    color: white;
    width: 30px;
    height: 30px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 16px;
    transition: background 0.15s ease;
  }

  .arrow-btn:hover {
    background: rgba(255,255,255,0.22);
  }

  .weekdays,
  .calendar-grid {
    display: grid;
    
    grid-template-columns: repeat(7, 1fr);
  }

  .weekday {
    text-align: center;
    padding: 10px 0;
    background: #ececec;
    font-size: 13px;
    font-weight: bold;
  }

  .calendar-grid {
    grid-auto-rows: 72px;
  }

  .day-cell {
    position: relative;
    border: 1px solid #efefef;
    cursor: pointer;
    background: white;
    transition: background 0.15s ease;
  }

  .day-cell:hover {
    background: #f7fbff;
  }

  .day-cell.selected {
    background: #dcebff;
  }

  .day-number {
    position: absolute;
    top: 8px;
    left: 8px;
    font-size: 14px;
    font-weight: bold;
  }

  .circle {
    position: absolute;
    bottom: 10px;
    left: 50%;
    transform: translateX(-50%);
    border-radius: 999px;
  }

  .circle.small {
    width: 12px;
    height: 12px;
  }

  .circle.big {
    width: 24px;
    height: 24px;
  }

  .empty-cell {
    border: 1px solid #f3f3f3;
    background: #fafafa;
  }
`;