import type { CSSProperties } from "react";
import { useState } from "react";

import logoIcon from "./assets/logo-144w.webp";

type LoginErrors = {
	username?: string;
	password?: string;
};

type RegisterErrors = {
	username?: string;
	email?: string;
	contact?: string;
	password?: string;
};

export function LoginPopup() {
	const [showRegister, setShowRegister] = useState(false);
	const [showSavedPopup] = useState(false);
	const [loginData, setLoginData] = useState({
		username: "",
		password: "",
	});

	const [registerData, setRegisterData] = useState({
		username: "",
		email: "",
		contact: "",
		password: "",
	});

	const [loginErrors] = useState<LoginErrors>({});
	const [registerErrors] = useState<RegisterErrors>({});

	return (
		<>
			<div style={styles.overlay}>
				<div style={styles.popup}>
					<img src={logoIcon} alt="Logo" style={styles.logo} />

					<h1 style={styles.title}>Login</h1>

					<form className="space-y-5" action="/api/auth/login" method="post">
						<div>
							<label htmlFor="username" style={styles.label}>
								Username
							</label>

							<input
								type="text"
								value={loginData.username}
								onChange={(e) =>
									setLoginData({
										...loginData,
										username: e.target.value,
									})
								}
								name="username"
								style={styles.input}
								placeholder="Enter username"
							/>

							{loginErrors.username && (
								<p style={styles.errorText}>{loginErrors.username}</p>
							)}
						</div>

						<div>
							<label htmlFor="password" style={styles.label}>
								Password
							</label>

							<input
								type="password"
								value={loginData.password}
								onChange={(e) =>
									setLoginData({
										...loginData,
										password: e.target.value,
									})
								}
								name="password"
								style={styles.input}
								placeholder="Enter password"
							/>

							{loginErrors.password && (
								<p style={styles.errorText}>{loginErrors.password}</p>
							)}
						</div>

						<input hidden={true} name="role" value="patient" />

						<button type="submit" style={styles.saveButton}>
							Login
						</button>
					</form>

					<div style={styles.registerSection}>
						<p>Don't have an account?</p>

						<button
							type="button"
							onClick={() => setShowRegister(true)}
							style={styles.linkButton}
						>
							Register Here
						</button>
					</div>
				</div>
			</div>

			{showRegister && (
				<div style={styles.overlay}>
					<div style={styles.popup}>
						<button
							type="button"
							onClick={() => setShowRegister(false)}
							style={styles.xButton}
						>
							×
						</button>

						<h2 style={styles.title}>Create Account</h2>

						<form
							action="/api/auth/register"
							method="post"
							className="space-y-5"
						>
							<div>
								<label htmlFor="username" style={styles.label}>
									Username
								</label>

								<input
									type="text"
									name="username"
									value={registerData.username}
									onChange={(e) =>
										setRegisterData({
											...registerData,
											username: e.target.value,
										})
									}
									style={styles.input}
									placeholder="Enter username"
								/>

								{registerErrors.username && (
									<p style={styles.errorText}>{registerErrors.username}</p>
								)}
							</div>

							<div>
								<label htmlFor="email" style={styles.label}>
									Email
								</label>

								<input
									type="email"
									value={registerData.email}
									onChange={(e) =>
										setRegisterData({
											...registerData,
											email: e.target.value,
										})
									}
									name="email"
									style={styles.input}
									placeholder="Enter email"
								/>

								{registerErrors.email && (
									<p style={styles.errorText}>{registerErrors.email}</p>
								)}
							</div>

							<div>
								<label htmlFor="contact_number" style={styles.label}>
									Contact Number
								</label>

								<input
									type="text"
									value={registerData.contact}
									onChange={(e) =>
										setRegisterData({
											...registerData,
											contact: e.target.value,
										})
									}
									name="contact_number"
									style={styles.input}
									placeholder="Enter contact number"
								/>

								{registerErrors.contact && (
									<p style={styles.errorText}>{registerErrors.contact}</p>
								)}
							</div>

							<div>
								<label htmlFor="password" style={styles.label}>
									Password
								</label>

								<input
									name="password"
									type="password"
									value={registerData.password}
									onChange={(e) =>
										setRegisterData({
											...registerData,
											password: e.target.value,
										})
									}
									style={styles.input}
									placeholder="Enter password"
								/>

								{registerErrors.password && (
									<p style={styles.errorText}>{registerErrors.password}</p>
								)}
							</div>

							<input hidden={true} name="role" value="patient" />

							<button type="submit" style={styles.saveButton}>
								Register
							</button>
						</form>
					</div>
				</div>
			)}

			{showSavedPopup && (
				<div style={styles.savedPopup}>Saved successfully!</div>
			)}
		</>
	);
}

const styles: Record<string, CSSProperties> = {
	overlay: {
		position: "fixed",
		inset: 0,
		backgroundColor: "rgba(0,0,0,0.6)",
		display: "flex",
		justifyContent: "center",
		alignItems: "center",
		zIndex: 1000,
	},

	popup: {
		width: "600px",
		maxWidth: "90%",
		borderRadius: "16px",
		padding: "30px",
		backgroundColor: "white",
		display: "flex",
		flexDirection: "column",
		gap: "15px",
		boxShadow: "0 0 20px rgba(0,0,0,0.5)",
		position: "relative",
	},

	logo: {
		width: "140px",
		alignSelf: "center",
		marginBottom: "10px",
		background:"transparent"
	},

	title: {
		margin: 0,
		textAlign: "center",
	},

	label: {
		fontSize: "14px",
		fontWeight: "bold",
		display: "block",
		marginTop: "20px",
		marginBottom: "20px",
	},

	input: {
		width: "100%",
		padding: "10px",
		outline: "2px solid black",
		border: "none",
		borderRadius: "8px",
		fontSize: "16px",
		boxSizing: "border-box",
	},

	saveButton: {
		marginTop: "50px",
		padding: "12px",
		border: "none",
		borderRadius: "10px",
		backgroundColor: "black",
		color: "white",
		fontSize: "16px",
		cursor: "pointer",
		width: "100%",
	},

	registerSection: {
		textAlign: "center",
	},

	linkButton: {
		border: "none",
		background: "none",
		color: "blue",
		cursor: "pointer",
		fontSize: "16px",
	},

	xButton: {
		position: "absolute",
		top: "10px",
		right: "10px",
		width: "40px",
		height: "40px",
		borderRadius: "50%",
		border: "2px solid black",
		backgroundColor: "white",
		cursor: "pointer",
		fontSize: "20px",
		fontWeight: "bold",
	},

	errorText: {
		color: "red",
		fontSize: "14px",
		marginTop: "5px",
	},

	savedPopup: {
		position: "fixed",
		bottom: "30px",
		right: "30px",
		backgroundColor: "black",
		color: "white",
		padding: "15px 20px",
		borderRadius: "10px",
		zIndex: 2000,
	},
};
