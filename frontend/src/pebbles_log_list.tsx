import { useEffect, useState } from "react";
import { Calendar } from "./calendar.tsx";
import type { MoodLog } from "./types/mood.ts";
import "./pebbles_log_list.css";
import calendarIcon from "./assets/calendar.png";
import { useMoods } from "./features/moods/hooks/use-moods.ts";

type RGB = {
	r: number;
	g: number;
	b: number;
};

export function PebbleLogListScreen({
	dismissPebbleLogListScreenAndShowHUD = () => {},
}) {
	const [calendarOpen, setCalendarOpen] = useState(false);
	const [selectedDate, setSelectedDate] = useState<string>(
		new Date().toLocaleDateString('en-CA'),
	);
	const moodLogData = useMoods(true);

	// -----------------------------------
	// Filter logs for selected day
	// -----------------------------------
	const [dayLogs, setDayLogs] = useState<MoodLog[]>(() => {
		return moodLogData.moods.filter((log) => {
			const logLocalDate = new Date(log.timestamp).toLocaleDateString('en-CA');
			return logLocalDate === selectedDate;
		});
	});

	const setSelectedDate_Shared = (date: Date) => {
		setSelectedDate(date.toLocaleDateString('en-CA'));
	};

	useEffect(() => {
		setDayLogs(
			moodLogData.moods.filter((log) => {
				const logLocalDate = new Date(log.timestamp).toLocaleDateString('en-CA');
				return logLocalDate === selectedDate;
			}),
		);
	}, [selectedDate, moodLogData.moods]);
	return (
		<div className="overlay">
			{calendarOpen && (
				<Calendar
					setCalendarOpen={() => setCalendarOpen(false)}
					setSelectedDay_Parent={setSelectedDate_Shared}
				/>
			)}
			<button
				className="topRightXButton_topRight"
				onClick={dismissPebbleLogListScreenAndShowHUD}
			>
				x
			</button>

			<button
				onClick={() => setCalendarOpen(true)}
				style={styles.calendarButton}
				value={selectedDate}
			>
				<img style={{ width: "50px" }} src={calendarIcon} />
			</button>
			<div className="box" style={styles.page}>
				{/* Top Bar */}
				<div style={styles.topBar}>
					{/* Date */}
					<div id="logDateText">{formatDate(selectedDate)}</div>

					{/* Calendar Picker */}
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
							<span style={styles.hourText}>{formatHour(hour)}</span>

							{addTick(hour)}
						</div>
					))}

					{/* Logs */}
					{dayLogs.map((log) => {
						const date = new Date(log.timestamp);

						const minutes = date.getHours() * 60 + date.getMinutes();

						const topPercent = (minutes / 1440) * 100;

						const color = interpolateGradient(Math.abs(log.valence), [
							{
								stop: 0,
								color: { r: 31, g: 154, b: 194 },
							},
							{
								stop: 100,
								color: { r: 243, g: 180, b: 56 },
							},
						]);

						console.log("daylog", date, log.valence, log.arousal);
            const size = ((log.arousal / 100) * 35) + 5
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
		</div>
	);
}

// -----------------------------------
// Helpers
// -----------------------------------
function formatHour(hour: number): string {
	const suffix = hour >= 12 ? "PM" : "AM";

	let h = hour % 12;

	if (h === 0) h = 12;

	if (h % 6 != 0) return "";

	return `${h}${suffix}`;
}

function addTick(hour: number) {
	if (hour % 6 != 0) return;
	return <div style={styles.tick} />;
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
	gradient: { stop: number; color: RGB }[],
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

// -----------------------------------
// Styles
// -----------------------------------
const styles: Record<string, any> = {
	page: {
		position: "fixed",
		width: "50%",
		height: "90%",
		background: "white",
		fontFamily: "youngseifRegular",
		display: "flex",
		flexDirection: "column",
		alignItems: "center",
		padding: "0",

		color: "black",
	},

	topBar: {
		width: "100%",
		display: "flex",
		background: "black",
		color: "white",
		justifyContent: "center",
		alignItems: "center",
		padding: "30px",
		borderTopLeftRadius: "10px",
		borderTopRightRadius: "10px",
		boxSizing: "border-box",
	},

	calendarButton: {
		width: "60px",
		height: "60px",
		top: "90px",
		right: "20px",
		borderRadius: "18px",
		background: "white",
		border: "5px solid black",
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		cursor: "pointer",

		position: "absolute",
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
		transition: "width 0.15s ease, height 0.15s ease",
    outline: "2px solid white"
	},
};
