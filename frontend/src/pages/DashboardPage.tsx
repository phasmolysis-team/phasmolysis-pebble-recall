import { Box, Container, Stack, Typography } from "@mui/material";
import { AuthPanel } from "../features/auth/components/AuthPanel";
import { useAuth } from "../features/auth/hooks/use-auth";
import { MoodPanel } from "../features/moods/components/MoodPanel";
import { useMoods } from "../features/moods/hooks/use-moods";

export function DashboardPage() {
	const auth = useAuth();
	const moods = useMoods(Boolean(auth.user));

	if (!auth.user) {
		return (
			<Box
				sx={{
					alignItems: "center",
					display: "grid",
					minHeight: "100svh",
					py: { xs: 3, md: 6 },
				}}
			>
				<Container maxWidth="lg">
					<Stack
						direction={{ xs: "column", md: "row" }}
						spacing={{ xs: 4, md: 8 }}
						sx={{ alignItems: "center" }}
					>
						<Stack spacing={2} sx={{ flex: 1 }}>
							<Typography
								color="text.secondary"
								sx={{
									fontSize: 12,
									fontWeight: 700,
									textTransform: "uppercase",
								}}
							>
								Pebble ReCall
							</Typography>
							<Typography
								component="h1"
								sx={{ fontWeight: 850, lineHeight: 1.02 }}
								variant="h2"
							>
								Mental health tracking for patients and professionals.
							</Typography>
							<Typography color="text.secondary" sx={{ maxWidth: 620 }}>
								Register a patient account, or create a professional account
								with a license ID. Login creates the backend session cookie used
								by protected FastAPI routes.
							</Typography>
						</Stack>

						<Stack sx={{ flex: 1, maxWidth: 520, width: "100%" }}>
							<AuthPanel
								error={auth.error}
								isLoading={auth.isLoading}
								isLoginPending={auth.login.isPending}
								isLogoutPending={auth.logout.isPending}
								isRegisterPending={auth.register.isPending}
								loginError={auth.login.error}
								onLogin={auth.login.mutateAsync}
								onLogout={auth.logout.mutateAsync}
								onRegister={auth.register.mutateAsync}
								registerError={auth.register.error}
								user={auth.user}
							/>
						</Stack>
					</Stack>
				</Container>
			</Box>
		);
	}

	return (
		<Container maxWidth="lg" sx={{ py: { xs: 3, md: 6 } }}>
			<Stack spacing={4}>
				<Stack spacing={1}>
					<Typography
						color="text.secondary"
						sx={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase" }}
					>
						Pebble ReCall
					</Typography>
					<Typography
						component="h1"
						sx={{ fontWeight: 800, lineHeight: 1.05 }}
						variant="h2"
					>
						Care tracking dashboard
					</Typography>
					<Typography color="text.secondary" sx={{ maxWidth: 720 }}>
						Frontend integration surface for the FastAPI session, user, and mood
						APIs.
					</Typography>
				</Stack>

				<Stack direction={{ xs: "column", md: "row" }} spacing={2}>
					<Stack sx={{ flex: 1 }}>
						<AuthPanel
							error={auth.error}
							isLoading={auth.isLoading}
							isLoginPending={auth.login.isPending}
							isLogoutPending={auth.logout.isPending}
							isRegisterPending={auth.register.isPending}
							loginError={auth.login.error}
							onLogin={auth.login.mutateAsync}
							onLogout={auth.logout.mutateAsync}
							onRegister={auth.register.mutateAsync}
							registerError={auth.register.error}
							user={auth.user}
						/>
					</Stack>
					<Stack sx={{ flex: 1 }}>
						<MoodPanel
							createError={moods.createMood.error}
							error={moods.error}
							isCreatePending={moods.createMood.isPending}
							isDisabled={!auth.user}
							isLoading={moods.isLoading}
							moods={moods.moods}
							onCreateMood={moods.createMood.mutateAsync}
						/>
					</Stack>
				</Stack>
			</Stack>
		</Container>
	);
}
