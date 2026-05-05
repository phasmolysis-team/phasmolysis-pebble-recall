import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import {
	Alert,
	Avatar,
	Box,
	Button,
	Card,
	CardContent,
	Chip,
	Divider,
	FormControl,
	FormHelperText,
	InputLabel,
	MenuItem,
	Select,
	Stack,
	Tab,
	Tabs,
	TextField,
	Typography,
} from "@mui/material";
import { type ReactNode, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import type { LoginPayload, RegisterPayload, User } from "@/types/auth";

type AuthPanelProps = {
	user: User | null;
	isLoading: boolean;
	error: Error | null;
	onLogin: (payload: LoginPayload) => Promise<unknown>;
	onLogout: () => Promise<unknown>;
	onRegister: (payload: RegisterPayload) => Promise<unknown>;
	isLoginPending: boolean;
	isLogoutPending: boolean;
	isRegisterPending: boolean;
	loginError: Error | null;
	registerError: Error | null;
};

type RegisterFormValues = RegisterPayload & {
	account_type: "patient" | "professional";
};

const defaultLogin: LoginPayload = {
	username: "",
	password: "",
	role: "patient",
};

const defaultRegister: RegisterFormValues = {
	username: "",
	email: "",
	contact_number: "",
	professional_license_id: "",
	password: "",
	account_type: "patient",
};

export function AuthPanel({
	user,
	isLoading,
	error,
	onLogin,
	onLogout,
	onRegister,
	isLoginPending,
	isLogoutPending,
	isRegisterPending,
	loginError,
	registerError,
}: AuthPanelProps) {
	const [selectedTab, setSelectedTab] = useState(0);
	const [registrationSuccess, setRegistrationSuccess] = useState(false);
	const loginForm = useForm<LoginPayload>({ defaultValues: defaultLogin });
	const registerForm = useForm<RegisterFormValues>({
		defaultValues: defaultRegister,
	});
	const accountType = registerForm.watch("account_type");

	async function submitLogin(payload: LoginPayload) {
		setRegistrationSuccess(false);
		await onLogin(payload);
		loginForm.reset(defaultLogin);
	}

	async function submitRegister(payload: RegisterFormValues) {
		await onRegister({
			username: payload.username?.trim() || undefined,
			email: payload.email,
			contact_number: payload.contact_number,
			password: payload.password,
			professional_license_id:
				payload.account_type === "professional"
					? payload.professional_license_id?.trim()
					: undefined,
		});

		registerForm.reset(defaultRegister);
		setRegistrationSuccess(true);
		setSelectedTab(0);
	}

	if (user) {
		return (
			<Card variant="outlined">
				<CardContent>
					<Stack spacing={3}>
						<PanelHeader
							chip={<Chip color="success" label="Authenticated" size="small" />}
							icon={<BadgeOutlinedIcon />}
							label="Active session"
							title={user.username ?? user.email}
						/>

						<Stack divider={<Divider flexItem />} spacing={1.5}>
							<ProfileRow label="Email" value={user.email} />
							<ProfileRow label="Contact" value={user.contact_number} />
							<ProfileRow
								label="Role"
								value={user.role?.join(", ") ?? "Unknown"}
							/>
						</Stack>

						<Button
							color="inherit"
							disabled={isLogoutPending}
							onClick={() => void onLogout()}
							type="button"
							variant="outlined"
						>
							{isLogoutPending ? "Logging out" : "Logout"}
						</Button>
					</Stack>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card
			elevation={0}
			sx={{
				border: 1,
				borderColor: "divider",
				borderRadius: 3,
				overflow: "hidden",
			}}
		>
			<Box
				sx={{
					bgcolor: "primary.main",
					color: "primary.contrastText",
					px: { xs: 2.5, sm: 3 },
					py: 2.5,
				}}
			>
				<Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
					<Avatar sx={{ bgcolor: "primary.dark" }}>
						<LockOutlinedIcon />
					</Avatar>
					<Box>
						<Typography sx={{ fontSize: 12, fontWeight: 700, opacity: 0.82 }}>
							Secure access
						</Typography>
						<Typography component="h2" sx={{ fontWeight: 800 }} variant="h5">
							Pebble ReCall account
						</Typography>
					</Box>
				</Stack>
			</Box>

			<CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
				<Stack spacing={3}>
					<Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
						<Chip
							color={isLoading ? "info" : "default"}
							label={isLoading ? "Checking session" : "Not signed in"}
							size="small"
						/>
						{error && (
							<Chip color="error" label="Connection issue" size="small" />
						)}
					</Stack>

					<Tabs
						onChange={(_, value: number) => {
							setSelectedTab(value);
							setRegistrationSuccess(false);
						}}
						value={selectedTab}
						variant="fullWidth"
					>
						<Tab label="Login" />
						<Tab label="Create account" />
					</Tabs>

					{selectedTab === 0 ? (
						<Stack
							component="form"
							onSubmit={(event) =>
								void loginForm.handleSubmit(submitLogin)(event)
							}
							spacing={2.5}
						>
							{registrationSuccess && (
								<Alert severity="success">
									Account created. You can now sign in.
								</Alert>
							)}
							{loginError && (
								<Alert severity="error">{loginError.message}</Alert>
							)}
							{error && <Alert severity="warning">{error.message}</Alert>}

							<TextField
								autoComplete="username"
								error={Boolean(loginForm.formState.errors.username)}
								helperText={loginForm.formState.errors.username?.message}
								label="Username or email"
								{...loginForm.register("username", {
									required: "Username or email is required",
								})}
							/>
							<TextField
								autoComplete="current-password"
								error={Boolean(loginForm.formState.errors.password)}
								helperText={loginForm.formState.errors.password?.message}
								label="Password"
								type="password"
								{...loginForm.register("password", {
									required: "Password is required",
								})}
							/>
							<Controller
								control={loginForm.control}
								name="role"
								render={({ field }) => (
									<FormControl>
										<InputLabel id="login-role-label">Role</InputLabel>
										<Select label="Role" labelId="login-role-label" {...field}>
											<MenuItem value="patient">Patient</MenuItem>
											<MenuItem value="professional">Professional</MenuItem>
										</Select>
										<FormHelperText>
											The backend requires this on login.
										</FormHelperText>
									</FormControl>
								)}
							/>
							<Button
								disabled={isLoginPending}
								size="large"
								type="submit"
								variant="contained"
							>
								{isLoginPending ? "Signing in" : "Login"}
							</Button>
						</Stack>
					) : (
						<Stack
							component="form"
							onSubmit={(event) =>
								void registerForm.handleSubmit(submitRegister)(event)
							}
							spacing={2.5}
						>
							{registerError && (
								<Alert severity="error">{registerError.message}</Alert>
							)}

							<Controller
								control={registerForm.control}
								name="account_type"
								render={({ field }) => (
									<FormControl>
										<InputLabel id="register-account-type-label">
											Account type
										</InputLabel>
										<Select
											label="Account type"
											labelId="register-account-type-label"
											{...field}
										>
											<MenuItem value="patient">Patient</MenuItem>
											<MenuItem value="professional">Professional</MenuItem>
										</Select>
										<FormHelperText>
											The backend assigns professional role when license ID is
											present.
										</FormHelperText>
									</FormControl>
								)}
							/>
							<TextField
								autoComplete="username"
								label="Username"
								{...registerForm.register("username")}
							/>
							<TextField
								autoComplete="email"
								error={Boolean(registerForm.formState.errors.email)}
								helperText={registerForm.formState.errors.email?.message}
								label="Email"
								type="email"
								{...registerForm.register("email", {
									required: "Email is required",
								})}
							/>
							<TextField
								autoComplete="tel"
								error={Boolean(registerForm.formState.errors.contact_number)}
								helperText={
									registerForm.formState.errors.contact_number?.message
								}
								label="Contact number"
								{...registerForm.register("contact_number", {
									required: "Contact number is required",
								})}
							/>
							{accountType === "professional" && (
								<TextField
									error={Boolean(
										registerForm.formState.errors.professional_license_id,
									)}
									helperText={
										registerForm.formState.errors.professional_license_id
											?.message
									}
									label="Professional license ID"
									{...registerForm.register("professional_license_id", {
										required: "Professional license ID is required",
									})}
								/>
							)}
							<TextField
								autoComplete="new-password"
								error={Boolean(registerForm.formState.errors.password)}
								helperText={registerForm.formState.errors.password?.message}
								label="Password"
								type="password"
								{...registerForm.register("password", {
									required: "Password is required",
									minLength: {
										value: 8,
										message: "Password should be at least 8 characters",
									},
								})}
							/>
							<Button
								disabled={isRegisterPending}
								size="large"
								type="submit"
								variant="contained"
							>
								{isRegisterPending ? "Creating account" : "Create account"}
							</Button>
						</Stack>
					)}
				</Stack>
			</CardContent>
		</Card>
	);
}

function PanelHeader({
	chip,
	icon,
	label,
	title,
}: {
	chip: ReactNode;
	icon: ReactNode;
	label: string;
	title: string;
}) {
	return (
		<Stack
			direction="row"
			spacing={2}
			sx={{ alignItems: "flex-start", justifyContent: "space-between" }}
		>
			<Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
				<Avatar sx={{ bgcolor: "action.hover", color: "text.primary" }}>
					{icon}
				</Avatar>
				<Box>
					<Typography
						color="text.secondary"
						sx={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase" }}
					>
						{label}
					</Typography>
					<Typography component="h2" sx={{ fontWeight: 700 }} variant="h5">
						{title}
					</Typography>
				</Box>
			</Stack>
			{chip}
		</Stack>
	);
}

function ProfileRow({ label, value }: { label: string; value: string }) {
	return (
		<Stack direction="row" spacing={2} sx={{ justifyContent: "space-between" }}>
			<Typography color="text.secondary">{label}</Typography>
			<Typography
				sx={{ fontWeight: 700, overflowWrap: "anywhere", textAlign: "right" }}
			>
				{value}
			</Typography>
		</Stack>
	);
}
