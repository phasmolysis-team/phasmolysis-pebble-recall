import { useEffect, useMemo, useState } from "react";
import { useMoods } from "./features/moods/hooks/use-moods.ts";
import type { MoodLog } from "./types/mood.ts";

type CircleSize = "small" | "big";

function randomSize(): "big" | "small" {
	return Math.random() < 0.5 ? "big" : "small";
}

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

export function Calendar({
	setCalendarOpen = () => {},
	setSelectedDay_Parent = (_date: Date) => {},
}) {
	const moodLogData = useMoods(true);
	const [currentMoodLogMonth, setCurrentMoodLogMonth] = useState<MoodLog[]>([]);
	const today = useMemo(() => new Date(), []);

	const [currentMonth, setCurrentMonth] = useState<number>(today.getMonth());

	const [currentYear, setCurrentYear] = useState<number>(today.getFullYear());
	const [firstDay, setFirstday] = useState<number>(
		new Date(currentYear, currentMonth, 1).getDay(),
	);

	const [totalDays, setTotalDays] = useState<number>(
		new Date(currentYear, currentMonth + 1, 0).getDate(),
	);

	const [monthLabel, setMonthLabel] = useState<string>(
		new Date(currentYear, currentMonth).toLocaleString("default", {
			month: "long",
			year: "numeric",
		}),
	);
	const [info, setInfo] = useState<Record<number, DayInfo>>(() => {
		const tmpInfo: Record<number, DayInfo> = {};

		for (const m of currentMoodLogMonth) {
			const day = new Date(m.timestamp).getDay();
			tmpInfo[day] = {
				size: randomSize(),
				value: m.valence,
			};
		}
		return tmpInfo
	});
	const [cells, setCells] = useState<React.ReactNode[]>(() => {

		const tcells: React.ReactNode[] =[]
		for (let i = 0; i < firstDay; i++) {
			tcells.push(<div className="empty-cell" key={`empty-${i}`} />);
		}

		// Actual day cells
		for (let day = 1; day <= totalDays; day++) {
			const dayinfo = info[day];

			tcells.push(
				<div
					key={day}
					className={`day-cell`}
					onClick={() =>
						setSelectedDayAndDismissCalendar(
							new Date(currentYear, currentMonth, day),
						)
					}
				>
					<div className="day-number">{day}</div>

					{dayinfo && (
						<div
							className={`circle ${dayinfo.size}`}
							style={{
								background: gradientColor(dayinfo.value),
							}}
						/>
					)}
				</div>,
			);
		}
		return tcells
	});

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
		setCurrentMoodLogMonth(
			moodLogData.moods.filter((m) => {
				const t = new Date(m.timestamp);
				return t.getMonth() === currentMonth;
			}),
		);

		const tmpInfo: Record<number, DayInfo> = {};

		for (const m of currentMoodLogMonth) {
			const day = new Date(m.timestamp).getDay();
			tmpInfo[day] = {
				size: randomSize(),
				value: m.valence,
			};
		}
		setInfo(tmpInfo);

		setCurrentYear(newYear);
		setFirstday(new Date(currentYear, currentMonth, 1).getDay());
		setTotalDays(new Date(currentYear, currentMonth + 1, 0).getDate());
		setMonthLabel(
			new Date(currentYear, currentMonth).toLocaleString("default", {
				month: "long",
				year: "numeric",
			}),
		);
		const tcells: React.ReactNode[] =[]
		for (let i = 0; i < firstDay; i++) {
			tcells.push(<div className="empty-cell" key={`empty-${i}`} />);
		}

		// Actual day cells
		for (let day = 1; day <= totalDays; day++) {
			const dayinfo = info[day];

			tcells.push(
				<div
					key={day}
					className={`day-cell`}
					onClick={() =>
						setSelectedDayAndDismissCalendar(
							new Date(currentYear, currentMonth, day),
						)
					}
				>
					<div className="day-number">{day}</div>

					{dayinfo && (
						<div
							className={`circle ${dayinfo.size}`}
							style={{
								background: gradientColor(dayinfo.value),
							}}
						/>
					)}
				</div>,
			);
		}
		setCells(tcells)
	}

	function changeYear(offset: number): void {
		setCurrentYear((prev) => prev + offset);
	}

	function setSelectedDayAndDismissCalendar(givenDate: Date): void {
		setSelectedDay_Parent(givenDate);
		setCalendarOpen();
	}

	useEffect(() => {
    		changeMonth(0)
	}, [currentYear])

	// Leading empty cells
	return (
		<>
			<style>{styles}</style>
			<button
				className="topRightXButton_topRight"
				style={{ zIndex: "3" }}
				onClick={() => setCalendarOpen()}
			>
				x
			</button>
			<div className="calendar-flex-container overlay">
				<div className="calendar-wrapper">
					<div className="calendar-header">
						{/* Year controls */}
						<div className="arrow-group">
							<button className="arrow-btn" onClick={() => changeYear(-1)}>
								«
							</button>

							<button className="arrow-btn" onClick={() => changeMonth(-1)}>
								‹
							</button>
						</div>

						<div className="header-center">{monthLabel}</div>

						{/* Month controls */}
						<div className="arrow-group">
							<button className="arrow-btn" onClick={() => changeMonth(1)}>
								›
							</button>

							<button className="arrow-btn" onClick={() => changeYear(1)}>
								»
							</button>
						</div>
					</div>

					<div className="weekdays">
						<div className="weekday">Sun</div>
						<div className="weekday">Mon</div>
						<div className="weekday">Tue</div>
						<div className="weekday">Wed</div>
						<div className="weekday">Thu</div>
						<div className="weekday">Fri</div>
						<div className="weekday">Sat</div>
					</div>

					{/* Only fills required rows */}
					<div className="calendar-grid">{cells}</div>
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

  }

  .calendar-flex-container{
    display:flex;
    width:100%;
    height:100%;
    justify-content: center;
    align-items: center;
    position:fixed;
    z-index: 2;
  }

  .calendar-wrapper {
    display:flex;
    flex-direction:column;
    background: white;
    
    width:70%;
    height:auto;
    border-radius: 20px;

    overflow: hidden;
    box-shadow: 0 4px 18px rgba(0,0,0,0.12);
      @media (max-width: 760px) {

      width:90%;

    }
  }

  .calendar-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 16px;
    background: white;
   
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
    background: rgba(0,0,0,1);
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
    background: black;
    color: white;
  
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
