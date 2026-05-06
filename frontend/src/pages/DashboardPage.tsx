import { Box, Container, Stack, Typography } from "@mui/material";
import { useAuth } from "@/features/auth/hooks/useAuth";
import {
	useCreateMedication,
	useCreateMedicationLog,
	useCreateSideEffectsMatrixLog,
	useLatestMedicationLog,
	useMedicationLogs,
	useMedications,
	useRetrieveSideEffectsMatrix,
} from "@/features/medications/hooks/useMedication";
import { useMoods } from "@/features/moods/hooks/useMoods";
import {
	useDeleteUserProfile,
	useUpdateUserProfile,
} from "@/features/users/hooks/useUserProfile";
import { AuthPanel } from "../features/auth/components/AuthPanel";
import { ExportPanel } from "../features/export/components/ExportPanel";
import { useExportPdf } from "../features/export/hooks/use-export-pdf";
import { MedicationCatalogPanel } from "../features/medications/components/MedicationCatalogPanel";
import { MedicationLogPanel } from "../features/medications/components/MedicationLogPanel";
import { SideEffectsPanel } from "../features/medications/components/SideEffectsPanel";
import { MoodPanel } from "../features/moods/components/MoodPanel";
import { ProfilePanel } from "../features/users/components/ProfilePanel";

export function DashboardPage() {
	const auth = useAuth();
	const moods = useMoods(Boolean(auth.user));
	const medications = useMedications(Boolean(auth.user));
	const medicationLogs = useMedicationLogs(Boolean(auth.user));
	const latestMedicationLog = useLatestMedicationLog(Boolean(auth.user));
	const createMedication = useCreateMedication();
	const createMedicationLog = useCreateMedicationLog();
	const createSideEffectsMatrixLog = useCreateSideEffectsMatrixLog();
	const retrieveSideEffectsMatrix = useRetrieveSideEffectsMatrix();
	const updateUserProfile = useUpdateUserProfile();
	const deleteUserProfile = useDeleteUserProfile();
	const exportPdf = useExportPdf();

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

	const user = auth.user;

	async function handleExportPdf() {
		const blob = await exportPdf.mutateAsync();
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.href = url;
		link.download = "pebble-recall-export.pdf";
		link.click();
		URL.revokeObjectURL(url);
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
							user={user}
						/>
					</Stack>
					<Stack sx={{ flex: 1 }}>
						<ProfilePanel
							deleteError={deleteUserProfile.error}
							isDeleting={deleteUserProfile.isPending}
							isUpdating={updateUserProfile.isPending}
							onDelete={() => deleteUserProfile.mutateAsync(user.id ?? 0)}
							onUpdate={(payload) =>
								updateUserProfile.mutateAsync({
									id: user.id ?? 0,
									payload,
								})
							}
							updateError={updateUserProfile.error}
							user={user}
						/>
					</Stack>
				</Stack>

				<Stack direction={{ xs: "column", md: "row" }} spacing={2}>
					<Stack sx={{ flex: 1 }}>
						<MoodPanel
							createError={moods.createMood.error}
							error={moods.error}
							isCreatePending={moods.createMood.isPending}
							isDisabled={false}
							isLoading={moods.isLoading}
							moods={moods.moods}
							onCreateMood={moods.createMood.mutateAsync}
						/>
					</Stack>
					<Stack sx={{ flex: 1 }}>
						<MedicationCatalogPanel
							createError={createMedication.error}
							error={medications.error}
							isCreating={createMedication.isPending}
							isLoading={medications.isLoading}
							medications={medications.data ?? []}
							onCreate={createMedication.mutateAsync}
						/>
					</Stack>
				</Stack>

				<Stack direction={{ xs: "column", md: "row" }} spacing={2}>
					<Stack sx={{ flex: 1 }}>
						<MedicationLogPanel
							createError={createMedicationLog.error}
							isCreating={createMedicationLog.isPending}
							isLoading={
								medicationLogs.isLoading || latestMedicationLog.isLoading
							}
							latestError={latestMedicationLog.error}
							latestLog={latestMedicationLog.data ?? null}
							logs={medicationLogs.data ?? []}
							logsError={medicationLogs.error}
							medications={medications.data ?? []}
							onCreate={createMedicationLog.mutateAsync}
						/>
					</Stack>
					<Stack sx={{ flex: 1 }}>
						<SideEffectsPanel
							createError={createSideEffectsMatrixLog.error}
							isCreating={createSideEffectsMatrixLog.isPending}
							isRetrieving={retrieveSideEffectsMatrix.isPending}
							medications={medications.data ?? []}
							onCreate={createSideEffectsMatrixLog.mutateAsync}
							onRetrieve={retrieveSideEffectsMatrix.mutateAsync}
							retrieveError={retrieveSideEffectsMatrix.error}
							retrievedLogs={retrieveSideEffectsMatrix.data}
						/>
					</Stack>
				</Stack>

				<Stack direction={{ xs: "column", md: "row" }} spacing={2}>
					<Stack sx={{ flex: 1 }}>
						<ExportPanel
							error={exportPdf.error}
							isExporting={exportPdf.isPending}
							onExport={handleExportPdf}
						/>
					</Stack>
				</Stack>
			</Stack>
		</Container>
	);
}
