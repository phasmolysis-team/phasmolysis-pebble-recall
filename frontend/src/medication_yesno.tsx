import { useState } from "react";
import sillyRockImage from "./assets/rock_question-320w.webp";

export function MedicationYesNoPopup() {
	const [dismissPopup, setDismissPopup] = useState(false);

	function dismissAndSendResponse(val: boolean): void {
		setDismissPopup(true);
		console.log("popup val received:  " + val);
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
