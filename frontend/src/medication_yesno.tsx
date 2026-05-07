import { useState, useEffect } from "react";
import sillyRockImage from "./assets/rock_question-320w.webp";

export function MedicationYesNoPopup() {
	let selMedication = "";
	const [dismissPopup, setDismissPopup] = useState(false);

	function dismissAndSendResponse(val: boolean): void {
		setDismissPopup(true);
		if (val){
		console.log("popup val received:  " + val);
		fetchMedications();
		submitLog()
		}

		
	}
	const fetchMedications = async () => {
			try {
				const response = await fetch("/api/medications", {
					method: "GET",
					credentials: "include",
				});

				if (!response.ok) {
					throw new Error("Failed to fetch medications");
				}

				const data = await response.json();

				console.log("Medications:", data);


				// Automatically select first medication
				if (data.length > 0) {
					medication = data[0].name;
				}
			} catch (error) {
				console.error(error);
			}
		};

		
	

	// Submit medication log
	const submitLog = async () => {
		try {
			const today = new Date().toISOString();

			const response = await fetch("/api/medications/logs", {
				method: "POST",
				credentials: "include",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					medication: selMedication,
					side_effects: "",
					custom_date: today,
				}),
			});

			if (!response.ok) {
				throw new Error("Failed to submit medication log");
			}

			const result = await response.json();

			console.log("Saved log:", result);
		} catch (error) {
			console.error(error);
		}
	}

	return (
		<>
			{!dismissPopup && (
				<div className="overlay">
					<div className="box">
						<img style={{ height: "300px" }} src={sillyRockImage} />
						<h2 style={styles.text}>Have you taken your medication?</h2>

						<div style={styles.buttonRow}>
							<button
								style={styles.button}
								onClick={() => dismissAndSendResponse(true)}
							>
								Yes
							</button>

							<button
								style={styles.button}
								onClick={() => dismissAndSendResponse(false)}
							>
								No
							</button>
						</div>
					</div>
				</div>
			)}
		</>
	);
}


const styles = {
	text: {
		color: "black",
		marginBottom: "20px",
	},

	buttonRow: {
		display: "flex",
		justifyContent: "center",
		gap: "100px",
	},

	button: {
		padding: "10px 20px",
		width: "100px",
		border: "none",
		borderRadius: "8px",
		cursor: "pointer",
		fontSize: "16px",
		fontFamily: "youngseifRegular",
		backgroundColor: "black",
		color:"white"
	},
};
